import * as React from "react";
import { Grid, Slider } from '@material-ui/core';
import { WSEditorProps } from "./WSEditorProps";
import { WSEditorStatus } from "./WSEditorStatus";
import { WSEditorDefaultProps } from "./WSEditorDefaultProps";
import { WSEditorViewCellCoord } from "./WSEditorViewCellCoord";
import { WSEditorSelection } from "./WSEditorSelection";
import { WSEditorCellEditor } from "./WSEditorCellEditor";
import { WSEditorCellCoord } from "./WSEditorCellCoord";
import { WSEditorRowInfo } from "./WSEditorRowInfo";
import { WSEditorSelectionRange } from "./WSEditorSelectionRange";
import { WSEditorColumnHeader } from "./WSEditorColumnHeader";
import { SortDirection } from "./Utils";
import { WSEditorRow } from "./WSEditorRow";

//-----------------------------------------------------------------------------------------------

export class WSEditor<T> extends React.PureComponent<WSEditorProps<T>, WSEditorStatus<T>>
{
    frameRef: React.RefObject<HTMLDivElement>;
    headerRowRef: React.RefObject<HTMLDivElement>;
    scrollableRef: React.RefObject<HTMLDivElement>;
    gridRef: React.RefObject<HTMLDivElement>;

    static defaultProps = WSEditorDefaultProps();

    constructor(props: WSEditorProps<T>) {
        super(props);

        this.frameRef = React.createRef();
        this.headerRowRef = React.createRef();
        this.scrollableRef = React.createRef();
        this.gridRef = React.createRef();

        const cWidths = [];
        for (let cIdx = 0; cIdx < this.props.cols.length; ++cIdx) cWidths.push(0);

        this.state = {
            //frameTargetElement: null,
            scrollOffset: 0,
            focusedViewCell: new WSEditorViewCellCoord<T>(-1, -1),
            directEditingViewCell: new WSEditorViewCellCoord<T>(-1, -1),
            hoverViewRowIdx: -1,
            headerRowHeight: 0,
            gridHeight: 0,
            selection: new WSEditorSelection<T>(this, []),
            columnWidths: cWidths
        };
    }

    //============================================
    // #region VIEW CELL REF
    //
    viewCellRefs: Map<string, any> = new Map<string, any>();

    setViewCellRef = (viewCell: WSEditorViewCellCoord<T>, ref: any) => this.viewCellRefs.set(viewCell.key(), ref);

    getViewCellRef = (viewCell: WSEditorViewCellCoord<T>) => this.viewCellRefs.get(viewCell.key());
    //
    // #endregion
    //--------------------------------------------

    //============================================
    // #region VIEW CELL EDITING
    //
    viewCellEditors: Map<string, WSEditorCellEditor<T>> = new Map<string, WSEditorCellEditor<T>>();

    setCellEditor = (viewCell: WSEditorViewCellCoord<T>, cellEditor: WSEditorCellEditor<T>) =>
        this.viewCellEditors.set(viewCell.key(), cellEditor);

    getCellEditor = (viewCell: WSEditorViewCellCoord<T>) => this.viewCellEditors.get(viewCell.key());

    focusCellEditor = (viewCell: WSEditorViewCellCoord<T>) => {
        const q = this.getCellEditor(viewCell);
        if (q) {
            q.focus();
            q.setDirectEditing(false);
        }
    }

    getCellData = (cell: WSEditorCellCoord<T>) => {
        const rowsCount = this.props.rows.length;
        if (cell.rowIdx >= rowsCount) {
            console.log("bound check failed");
            return "";
        }
        else {
            const d = this.props.rows[cell.rowIdx] as any;
            if (d)
                return (d)[this.props.cols[cell.colIdx].field];
            else
                return "";
        }
    }

    setViewCellData = (viewCell: WSEditorViewCellCoord<T>, newData: any) =>
        this.setCellData(viewCell.getCellCoord(this.state.scrollOffset), newData);

    setCellData = (cell: WSEditorCellCoord<T>, newData: any) => {
        const q = this.props.rows.slice();
        const row = q[cell.rowIdx];
        (row as any)[this.props.cols[cell.colIdx].field] = newData;
        this.props.setRows(q);
        if (this.props.onCellDataChanged) this.props.onCellDataChanged(this, row, cell, newData);
    }

    leaveCellEdit = (viewCell: WSEditorViewCellCoord<T>) => {
        const qref = this.getViewCellRef(viewCell);
        if (qref) qref.focus();
    }
    //
    // #endregion
    //--------------------------------------------    

    //============================================
    // #region ROW MANIPULATION
    //

    /** add a row and return its index */
    addRow = (newRow: T): number => {
        const addedRowIdx = this.props.rows.length;

        const q = this.props.rows.slice();
        q.push(newRow);
        this.props.setRows(q);

        if (this.props.onRowsAdded) this.props.onRowsAdded(this, [{ row: newRow, rowIdx: addedRowIdx }]);

        return addedRowIdx;
    }

    deleteRows = (rowIdxs: Set<number>) => {
        const notifyDeletedRowsInfo: WSEditorRowInfo<T>[] = [];

        const s = this.props.rows.slice();
        const q: T[] = [];
        for (let ridx = 0; ridx < this.props.rows.length; ++ridx) {
            if (!rowIdxs.has(ridx))
                q.push(s[ridx]);
            else {
                if (this.props.onRowsDeleted) {
                    notifyDeletedRowsInfo.push({ row: s[ridx], rowIdx: ridx });
                }
            }
        }
        this.props.setRows(q);

        if (this.props.onRowsDeleted) this.props.onRowsDeleted(this, notifyDeletedRowsInfo);
        const qbounds = this.state.selection.bounds;
        if (qbounds !== null) {
            const minRowIdx = qbounds.minRowIdx;
            const curColIdx = this.state.focusedViewCell ? this.state.focusedViewCell.viewColIdx : 0;
            const cell = new WSEditorCellCoord<T>(minRowIdx, curColIdx);
            //const viewCell = cell.getViewCellCoord(this.state.scrollOffset);            
            this.setState({ focusedViewCell: new WSEditorViewCellCoord<T>(-1, -1) });
            this.setSelection(cell, cell);
        } else
            this.clearSelection();
    }

    //
    // #endregion
    //--------------------------------------------    

    //============================================
    // #region EDITOR VIEW
    //
    setScrollOffset = (newOffset: number) => {
        let scrollOffset = newOffset;
        if (newOffset < 0)
            scrollOffset = 0;
        else if (newOffset > this.props.rows.length - this.props.viewRowCount!)
            scrollOffset = this.props.rows.length - this.props.viewRowCount!;

        this.setState({ scrollOffset: scrollOffset });
    }

    setCurrentCell = (cell: WSEditorCellCoord<T>, endingCell: boolean = false, clearPreviousSel: boolean = true) => {
        let scrollOffset = this.state.scrollOffset;
        if (cell.rowIdx - scrollOffset >= this.props.viewRowCount!)
            scrollOffset = cell.rowIdx - this.props.viewRowCount! + 1;
        else if (cell.rowIdx - scrollOffset < 0)
            scrollOffset = cell.rowIdx;

        //const newCell = new WSEditorCellCoord<T>(newRowIdx, newColIdx);
        const viewCell = cell.getViewCellCoord(scrollOffset);
        const multi = this.props.selectionModeMulti === true;
        const newSelection = (multi && endingCell === true) ? this.state.selection.extendsTo(cell) :
            (!multi || clearPreviousSel) ?
                new WSEditorSelection<T>(this, [new WSEditorSelectionRange<T>(cell, cell)]) :
                this.state.selection.add(cell);

        this.setState({
            scrollOffset: scrollOffset,
            focusedViewCell: viewCell,
            selection: newSelection
        });

        if (this.props.onSelectionChanged) this.props.onSelectionChanged(this, newSelection);

        const qref = this.getViewCellRef(viewCell);
        if (qref) {
            qref.focus();
        }
    }

    unsetDirectEditing = () => {
        this.setDirectEditingCell(new WSEditorViewCellCoord(-1, -1));
    }

    setDirectEditingCell = (viewCell: WSEditorViewCellCoord<T>) => {
        this.setState({
            directEditingViewCell: viewCell
        });
    }

    //
    // #endregion
    //--------------------------------------------

    //============================================
    // #region COLUMNS
    //        
    renderColumHeaders() {
        const res: React.ReactNode[] = [];

        for (let cIdx = 0; cIdx < this.props.cols.length; ++cIdx) {
            const col = this.props.cols[cIdx];
            col.viewColIdx = cIdx;

            res.push(<WSEditorColumnHeader editor={this} col={col} cIdx={cIdx} />);
        }

        return res;
    }

    setColumnWidth(cIdx: number, width: number) {
        const newColumnWidths = this.state.columnWidths.slice();
        newColumnWidths[cIdx] = width;
        this.setState({ columnWidths: newColumnWidths });
    }


    toggleColumnHeaderSort(colHdr: WSEditorColumnHeader<T>, maintainPreviousSort: boolean) {
        const col = colHdr.props.col;
        let sortDir = col.sortDir;

        if (col.sortDir === undefined || col.sortDir === SortDirection.Descending)
            sortDir = SortDirection.Ascending;
        else if (col.sortDir === SortDirection.Ascending)
            sortDir = SortDirection.Descending;

        this.setColumnHeaderSort(colHdr, sortDir, maintainPreviousSort);
    }

    setColumnHeaderSort(colHdr: WSEditorColumnHeader<T>, sort: SortDirection | undefined, maintainPreviousSort: boolean) {
        const q = this.props.cols.slice();
        for (let ci = 0; ci < this.props.cols.length; ++ci) {
            if (ci === colHdr.props.cIdx) {
                q[ci].sortDir = sort;
                if (!q[ci].sortOrder) q[ci].sortOrder = 0;
                q[ci].sortOrder!++;
            }
            else {
                if (!maintainPreviousSort) q[ci].sortDir = undefined;
            }
        }
        this.props.setCols(q);

        this.sortRows();
    }
    //
    // #endregion
    //--------------------------------------------    

    //============================================
    // #region SCROLL AND SELECTION RANGES
    //

    scrollToEnd() {
        this.scrollToRow(this.props.rows.length - 1);
    }

    /** rowsCount to help wseditor understand rows count when using programmatically add and select before update cycle */
    scrollToRow(rowIdx: number, _rowsCount?: number) {
        let scrollOffset = this.state.scrollOffset;
        let rowsCount = _rowsCount ? _rowsCount : this.props.rows.length;

        if (rowIdx < 0)
            scrollOffset = 0;
        else if (rowIdx >= rowsCount - this.props.viewRowCount!)
            scrollOffset = rowsCount - this.props.viewRowCount!;
        else
            scrollOffset = rowIdx;

        this.setState({ scrollOffset: scrollOffset });
    }

    selectedRows(): Set<number> {
        return this.state.selection.rowIdxs();
    }

    selectedRowsArray(): number[] {
        return Array.from(this.state.selection.rowIdxs());
    }

    selectRow(rowIdx: number) {
        this.setCurrentCell(new WSEditorCellCoord<T>(rowIdx, 0), false, true);
    }

    clearSelection() {
        this.setState({ selection: new WSEditorSelection(this, []) });
    }

    setSelection(from: WSEditorCellCoord<T>, to: WSEditorCellCoord<T>) {
        this.setState({ selection: new WSEditorSelection(this, [new WSEditorSelectionRange(from, to)]) });
    }

    selectionContains(viewCell: WSEditorViewCellCoord<T>) {
        const res = this.state.selection.containsViewcell(viewCell);
        return res;
    }

    //
    // #endregion
    //--------------------------------------------    

    //============================================
    // #region SORTING
    //        
    sortRows() {
        this.clearSelection();

        const sortBy = this.props.cols.filter(w => w.sortDir !== undefined).sort(w => w.sortOrder ? w.sortOrder : -1);
        let q = this.props.rows.slice();
        for (let si = sortBy.length - 1; si >= 0; --si) {
            const col_sortBy = sortBy[si];
            if (col_sortBy.sortDir === undefined) continue;
            if (col_sortBy.sortFn)
                q = q.sort((a: T, b: T) => col_sortBy.sortFn!(a, b, col_sortBy.sortDir || SortDirection.Ascending));
            else
                q = q.sort((a: any, b: any) => {
                    const valA = a[col_sortBy.field];
                    const valB = b[col_sortBy.field];
                    const ascRes = valA < valB ? -1 : 1;
                    if (col_sortBy.sortDir === SortDirection.Descending)
                        return -ascRes;
                    else
                        return ascRes;
                });
        }

        this.props.setRows(q);
    }
    //
    // #endregion
    //--------------------------------------------    

    //============================================
    // #region RENDER
    //        
    initialRender: boolean = true;

    setHoverViewRowIdx(viewRowIdx: number) {
        this.setState({ hoverViewRowIdx: viewRowIdx });
    }

    renderRows() {
        const res: React.ReactNode[] = [];

        if (this.initialRender && this.props.rows.length > 0) {
            this.initialRender = false;
            this.sortRows();
        }

        const rowsCount = this.props.rows.length;

        for (let viewRowIdx = 0; viewRowIdx < this.props.viewRowCount!; ++viewRowIdx) {
            const ridx = this.state.scrollOffset + viewRowIdx;
            if (ridx < 0 || ridx >= rowsCount) continue;

            res.push(<Grid
                key={"vr:" + viewRowIdx}
                container
                direction="row">
                <WSEditorRow viewRowIdx={viewRowIdx} editor={this} />
            </Grid>);
        }

        return res;
    }

    //  static getDerivedStateFromProps<T>(props: WSEditorProps<T>, state: WSEditorStatus<T>) {
    //      if (state.gridHeight === 0) {
    //          recompute
    //      }
    //      return null;
    //  }

    recomputeGridHeight(headerRowHeight: number) {
        if (this.gridRef && this.gridRef.current) {

            const children = this.gridRef.current.children;
            let realGridHeight = 0;
            for (let ci = 0; ci < children.length; ++ci) {
                realGridHeight += children.item(ci)!.clientHeight;
            }
            this.setState({
                headerRowHeight: headerRowHeight,
                gridHeight: realGridHeight
            });
        }
    }   

    handleWheel = (e: Event) => {
        e.preventDefault();
    }

    handleResize = (e: UIEvent) => {
        let hrh = this.state.headerRowHeight;

        if (this.headerRowRef && this.headerRowRef.current) {
            hrh = this.headerRowRef.current.clientHeight;
            //this.setState({ headerRowHeight: this.headerRowRef.current.clientHeight });
        }
        this.recomputeGridHeight(hrh);
    }

    touchInfo: Touch | null = null;

    handleTouchStart = (e: TouchEvent) => {
        this.touchInfo = e.touches.item(0);
    }

    handleTouchMove = (e: TouchEvent) => {
        if (this.props.disableScrollLock === true) {            
            return;
        }        

        const item = e.touches.item(0);
        if (item && this.touchInfo) {
            const x = item.clientX;
            const y = item.clientY;

            const dx = this.touchInfo.clientX - x;
            const dy = this.touchInfo.clientY - y;

            this.touchInfo = item;

            if (Math.abs(dy) > Math.abs(dx)) {
                let amount = 0;
                if (dy < 0) amount = -1; else if (dy > 0) amount = 1;
                this.setScrollOffset(this.state.scrollOffset + amount);
                e.preventDefault();
            }
        }
    }

    componentDidMount() {

        if (this.frameRef.current) {
            this.frameRef.current.addEventListener('touchmove', this.handleTouchMove, { passive: false });
            this.frameRef.current.addEventListener('touchstart', this.handleTouchStart, { passive: false });
            this.frameRef.current.addEventListener("wheel", this.handleWheel, { passive: false });
        }

        let hrh = this.state.headerRowHeight;

        if (this.headerRowRef && this.headerRowRef.current) {
            hrh = this.headerRowRef.current.clientHeight;
        }
        this.recomputeGridHeight(hrh);

        window.addEventListener("resize", this.handleResize);
    }

    componentWillUmount() {
        if (this.frameRef.current) {
            this.frameRef.current.removeEventListener("touchmove", this.handleTouchMove);
            this.frameRef.current.removeEventListener("touchstart", this.handleTouchStart);
            this.frameRef.current.removeEventListener("wheel", this.handleWheel);
        }

        window.removeEventListener("resize", this.handleResize);
    }

    componentDidUpdate(prevProps: Readonly<WSEditorProps<T>>, prevState: Readonly<WSEditorStatus<T>>) {
        const rowsCount = this.props.rows.length;
        if (this.state.scrollOffset + this.props.viewRowCount! >= rowsCount) {
            this.setScrollOffset(rowsCount - this.props.viewRowCount!);
        }
        if (this.headerRowRef && this.headerRowRef.current) {
            const v = this.headerRowRef.current.clientHeight;
            if (this.state.headerRowHeight !== v) {
                //this.setState({ headerRowHeight: v });
                this.recomputeGridHeight(v);
            }
        }
    }

    render() {

        let layoutWidth: string | number | undefined = undefined;

        if (this.props.width) {
            layoutWidth = "calc(" + this.props.width + " - 24px)";
        }
        else {
            layoutWidth = "calc(100% - 24px)";
        }

        if (this.props.rows.length > 0 && this.state.gridHeight === this.state.headerRowHeight) {
            this.recomputeGridHeight(this.state.headerRowHeight);
        }

        return <div            
            style={Object.assign(WSEditor.defaultProps.frameStyle!(), this.props.frameStyle!(), { overflow: "hidden" })}>
            {this.props.debug === true ?
                <div style={{ marginBottom: "1em", color: "green", fontSize: 13, fontFamily: "Monospace" }}>
                    scrollOffset: {this.state.scrollOffset} | rowsCount: {this.props.rows.length} | gridHeight: {this.state.gridHeight}
                    | headerRowHeight: {this.state.headerRowHeight}
                    | HScroll: {this.scrollableRef.current ? this.scrollableRef.current.scrollLeft : 0}
                    | Selection: {this.state.selection.toString()} | width: {this.props.width} | computedWidth: {layoutWidth} | hoverrowIdx: {this.state.hoverViewRowIdx}
                </div>
                : null}

            <Grid
                container={true}
                direction="row">
                <Grid item={true} style={{ width: layoutWidth }}
                >
                    <div
                        ref={this.scrollableRef}
                        style={Object.assign(WSEditor.defaultProps.tableStyle!(), this.props.tableStyle!())}
                    >
                        <div style={{
                            width: this.props.width ? this.props.width : "100%"
                        }}>
                            <Grid item={true} ref={this.gridRef}>
                                <Grid
                                    key={"vr:-1"}
                                    ref={this.headerRowRef}
                                    container={true} direction="row">
                                    {this.renderColumHeaders()}
                                </Grid>
                                <div ref={this.frameRef}
                                >
                                    {this.renderRows()}
                                </div>
                            </Grid>
                        </div>
                    </div>
                </Grid>
                {this.props.hideSlider !== true ?
                    <Grid item={true}
                        style={{
                            marginTop: this.state.headerRowHeight,
                            maxHeight: this.state.gridHeight - this.state.headerRowHeight
                        }}>
                        <Slider
                            orientation="vertical"
                            min={0}
                            style={{
                                maxHeight: this.state.gridHeight - this.state.headerRowHeight
                            }}
                            max={this.props.rows.length - this.props.viewRowCount!}
                            track={false}
                            value={this.props.rows.length - this.props.viewRowCount! - this.state.scrollOffset}
                            onKeyDown={(e) => {
                                if (e.key === "Home") {
                                    this.setState({ scrollOffset: 0 });
                                    e.preventDefault();
                                } else if (e.key === "End") {
                                    this.setState({ scrollOffset: this.props.rows.length - this.props.viewRowCount! });
                                    e.preventDefault();
                                }
                            }}
                            onWheel={(e) => {
                                const rowsCount = this.props.rows.length;
                                const step = Math.trunc(rowsCount / this.props.sliderWheelDivisionStep!);
                                if (e.deltaY > 0) {
                                    this.setState({
                                        scrollOffset: Math.max(0, Math.min(rowsCount - this.props.viewRowCount!, this.state.scrollOffset + step))
                                    })
                                    e.preventDefault();
                                } else if (e.deltaY < 0) {
                                    this.setState({
                                        scrollOffset: Math.max(0, Math.min(rowsCount - this.props.viewRowCount!, this.state.scrollOffset - step))
                                    })
                                    e.preventDefault();
                                }
                            }}
                            onChange={(e, v) => {
                                const n = v as number;
                                if (!isNaN(n)) {
                                    const rowsCount = this.props.rows.length;
                                    this.setState({
                                        scrollOffset: Math.max(rowsCount - this.props.viewRowCount! - n, 0)
                                    });
                                }
                            }} />
                    </Grid> : null}
            </Grid>
        </div>
    }
    //
    // #endregion
    //--------------------------------------------    
}
