import * as React from "react";
import { Grid, Slider } from '@material-ui/core';
import { SortDirection } from "./WSEditorColumn";
import WSEditorCellEditor from "./WSEditorCellEditor";
import WSEditorRow from "./WSEditorRow";
import WSEditorColumnHeader from "./WSEditorColumnHeader";
import WSEditorViewCellCoord from "./WSEditorViewCellCoord";
import WSEditorCellCoord from "./WSEditorCellCoord";
import WSEditorSelection, { WSEditorSelectionRange } from "./WSEditorSelection";
import WSEditorProps from "./WSEditorProps";
import { WSEditorDefaultProps } from "./WSEditorDefaultProps";

export interface WSEditorStatus<T> {
    scrollOffset: number;
    focusedViewCell: WSEditorViewCellCoord<T>;
    headerRowHeight: number;
    gridHeight: number;
    selection: WSEditorSelection<T>;
}

export interface WSEditorRowInfo<T> {
    rowIdx: number;
    row: T;
}

class WSEditor<T> extends React.PureComponent<WSEditorProps<T>, WSEditorStatus<T>>
{
    headerRowRef: React.RefObject<HTMLDivElement>;
    scrollableRef: React.RefObject<HTMLDivElement>;
    gridRef: React.RefObject<HTMLDivElement>;

    static defaultProps = WSEditorDefaultProps;

    constructor(props: WSEditorProps<T>) {
        super(props);

        this.headerRowRef = React.createRef();
        this.scrollableRef = React.createRef();
        this.gridRef = React.createRef();

        this.state = {
            scrollOffset: 0,
            focusedViewCell: new WSEditorViewCellCoord<T>(-1, -1),
            headerRowHeight: 0,
            gridHeight: 0,
            selection: new WSEditorSelection<T>(this, []),
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

    setCellEditor = (viewCell: WSEditorViewCellCoord<T>, cellEditor: WSEditorCellEditor<T, any>) =>
        this.viewCellEditors.set(viewCell.key(), cellEditor);

    getCellEditor = (viewCell: WSEditorViewCellCoord<T>) => this.viewCellEditors.get(viewCell.key());

    focusCellEditor = (viewCell: WSEditorViewCellCoord<T>) => {
        const q = this.getCellEditor(viewCell);
        if (q) {
            q.focus();
            q.setDirectEditing(false);
        }
    }

    getCellData = (viewCell: WSEditorViewCellCoord<T>) => {
        const cell = viewCell.getCellCoord(this.state.scrollOffset);
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
            res.push(<WSEditorColumnHeader
                key={"col:" + cIdx} editor={this} col={col} cIdx={cIdx} />);
        }

        return res;
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
        const res = this.state.selection.containsVieWcell(viewCell);
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

            res.push(<Grid key={"vr:" + viewRowIdx} container={true} direction="row">
                <WSEditorRow viewRowIdx={viewRowIdx} editor={this} />
            </Grid>);
        }

        return res;
    }

    // static getDerivedStateFromProps<T>() {        
    //     return null;
    // }

    recomputeGridHeight() {
        if (this.gridRef && this.gridRef.current) {

            const children = this.gridRef.current.children;
            let realGridHeight = 0;
            for (let ci = 0; ci < children.length; ++ci) {
                realGridHeight += children.item(ci)!.clientHeight;
            }
            this.setState({ gridHeight: realGridHeight });
        }
    }

    componentDidUpdate(prevProps: Readonly<WSEditorProps<T>>, prevState: Readonly<WSEditorStatus<T>>) {
        const rowsCount = this.props.rows.length;
        if (this.state.scrollOffset + this.props.viewRowCount! >= rowsCount) {
            this.setScrollOffset(rowsCount - this.props.viewRowCount!);
        }
        if (this.headerRowRef && this.headerRowRef.current) {
            const v = this.headerRowRef.current.clientHeight;
            if (this.state.headerRowHeight !== v) {
                this.setState({ headerRowHeight: v });
                this.recomputeGridHeight();
            }
        }
    }

    componentDidMount() {
        if (this.headerRowRef && this.headerRowRef.current) {
            this.setState({ headerRowHeight: this.headerRowRef.current.clientHeight });
        }
        this.recomputeGridHeight();

        window.addEventListener("resize", () => {
            if (this.headerRowRef && this.headerRowRef.current) {
                this.setState({ headerRowHeight: this.headerRowRef.current.clientHeight });
            }
            this.recomputeGridHeight();
        });
    }

    render() {
        return <div>
            {this.props.debug === true ?
                <div style={{ marginBottom: "1em", color: "green" }}>
                    scrollOffset: {this.state.scrollOffset} - rowsCount: {this.props.rows.length} - gridHeight: {this.state.gridHeight} - headerRowHeight: {this.state.headerRowHeight} - HScroll: {this.scrollableRef.current ? this.scrollableRef.current.scrollLeft : 0}
                    - Selection: {this.state.selection.toString()}
                </div>
                : null}
            <Grid
                container={true}
                direction="row">
                <Grid item={true} style={{
                    width: "calc(100% - 24px)"
                }} >
                    <div
                        ref={this.scrollableRef}
                        style={this.props.frameStyle}
                    >
                        <div style={{
                            width: this.props.width ? this.props.width : "100%"
                        }}>

                            <Grid container={true} direction="column">
                                <Grid item={true} ref={this.gridRef}>
                                    <Grid
                                        key={"vr:-1"}
                                        ref={this.headerRowRef}
                                        container={true} direction="row">
                                        {this.renderColumHeaders()}
                                    </Grid>
                                    {this.renderRows()}
                                </Grid>
                            </Grid >
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

export default WSEditor;