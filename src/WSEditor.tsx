import * as React from "react";
import { Grid, Slider } from '@material-ui/core';
import WSEditorColumn, { SortDirection } from "./WSEditorColumn";
import WSEditorCellEditor from "./WSEditorCellEditor";
import WSEditorRow from "./WSEditorRow";
import WSEditorColumnHeader from "./WSEditorColumnHeader";
import WSEditorViewCellCoord from "./WSEditorViewCellCoord";
import WSEditorCellCoord from "./WSEditorCellCoord";
import WSEditorSelection, { WSEditorSelectMode, WSEditorSelectionRange } from "./WSEditorSelection";
import WSEditorProps from "./WSEditorProps";
import { WSEditorDefaultProps } from "./WSEditorDefaultProps";
import { RowingSharp } from "@material-ui/icons";

export interface WSEditorStatus<T> {
    scrollOffset: number;
    focusedViewCell: WSEditorViewCellCoord<T>;
    headerRowHeight: number;
    gridHeight: number;
    selection: WSEditorSelection<T>;
}

export interface WSEditorCellNfo {
    isValid: boolean;
}

class WSEditor<T> extends React.PureComponent<WSEditorProps<T>, WSEditorStatus<T>>
{
    headerRowRef: React.RefObject<HTMLDivElement>;
    gridRef: React.RefObject<HTMLDivElement>;

    static defaultProps = WSEditorDefaultProps;

    constructor(props: WSEditorProps<T>) {
        super(props);

        this.headerRowRef = React.createRef();
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
        if (this.props.onCellDataChanged) this.props.onCellDataChanged(row, cell, newData);
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
    addRow = (newRow: T, autofocus: boolean = false): number => {
        const newRowIdx = this.props.rows.length;

        const q = this.props.rows.slice();
        q.push(newRow);
        this.props.setRows(q);

        /*if (autofocus) {
            this.setState({ scrollOffset: 12 });
        }*/

        return newRowIdx;
    }

    deleteRows = (rowIdxs: Set<number>) => {
        const s = this.props.rows.slice();
        const q: T[] = [];
        for (let ridx = 0; ridx < this.props.rows.length; ++ridx) {
            if (!rowIdxs.has(ridx)) q.push(s[ridx]);
        }
        this.props.setRows(q);
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

    setCurrentCell = (cell: WSEditorCellCoord<T>, endingCell: boolean = false, clearPreviousSel: boolean = true, _rowsCount?: number) => {
        let rowsCount = _rowsCount ? _rowsCount : this.props.rows.length;

        // sanity check
        let newRowIdx = cell.rowIdx;
        if (newRowIdx < 0)
            newRowIdx = 0;
        else if (newRowIdx >= rowsCount)
            newRowIdx = rowsCount - 1;

        let newColIdx = cell.colIdx;;
        if (newColIdx < 0)
            newColIdx = 0;
        else if (newColIdx >= this.props.cols.length)
            newColIdx = this.props.cols.length - 1;

        if (cell.rowIdx !== newRowIdx || cell.colIdx !== newColIdx)
            cell = new WSEditorCellCoord<T>(newRowIdx, newColIdx);

        let scrollOffset = this.state.scrollOffset;
        if (newRowIdx - scrollOffset >= this.props.viewRowCount!)
            scrollOffset = cell.rowIdx - this.props.viewRowCount! + 1;
        else if (newRowIdx - scrollOffset < 0)
            scrollOffset = cell.rowIdx;

        const newCell = new WSEditorCellCoord<T>(newRowIdx, newColIdx);
        const viewCell = newCell.getViewCellCoord(scrollOffset);
        const multi = this.props.selectionModeMulti === true;

        this.setState({
            scrollOffset: scrollOffset,
            focusedViewCell: viewCell,
            selection: (multi && endingCell === true) ? this.state.selection.extendsTo(newCell) :
                (!multi || clearPreviousSel) ?
                    new WSEditorSelection<T>(this, [new WSEditorSelectionRange<T>(newCell, newCell)]) :
                    this.state.selection.add(newCell)
        });

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

    /** rowsCount to help wseditor understand rows count when using programmatically add and select before update cycle */
    selectRow(rowIdx: number, rowsCount?: number) {
        this.setCurrentCell(new WSEditorCellCoord<T>(rowIdx, 0), false, true, rowsCount);
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
            const sortByNfo = sortBy[si];
            if (sortByNfo.sortDir === undefined) continue;
            q = q.sort((a: any, b: any) => {
                const valA = a[sortByNfo.field];
                const valB = b[sortByNfo.field];
                const ascRes = valA < valB ? -1 : 1;
                if (sortByNfo.sortDir === SortDirection.Descending)
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
    renderRows() {
        const res: React.ReactNode[] = [];

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

    static getDerivedStateFromProps<T>(nextProps: Readonly<WSEditorProps<T>>, prevState: any) {
        return null;
    }

    recomputeGridHeight() {
        if (this.gridRef && this.gridRef.current) {
            const v = this.gridRef.current.clientHeight;

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
            if (this.state.headerRowHeight !== v) this.setState({ headerRowHeight: v });
        }
        this.recomputeGridHeight();
        // if (this.gridRef && this.gridRef.current) {
        //     const v = this.gridRef.current.clientHeight;
        //     if (this.state.gridHeight !== v) {

        //         const children = this.gridRef.current.children;
        //         let realGridHeight = 0;
        //         for (let ci = 0; ci < children.length; ++ci) {
        //             realGridHeight += children.item(ci)!.clientHeight;
        //         }
        //         this.setState({ gridHeight: realGridHeight });
        //     }
        // }
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
        return <>
            <div style={{ marginBottom: "1em", color: "green" }}>
                scrollOffset: {this.state.scrollOffset} - rowsCount: {this.props.rows.length} - gridHeight: {this.state.gridHeight} - headerRowHeight: {this.state.headerRowHeight}
            </div>
            <Grid
                container={true}
                direction="row">
                <Grid item={true} xs >
                    <Grid container={true} direction="column">
                        <Grid item={true} ref={this.gridRef}>
                            <Grid
                                key={"vr:-1"}
                                ref={this.headerRowRef}
                                container={true} direction="row"                            >
                                {this.renderColumHeaders()}
                            </Grid>
                            {this.renderRows()}
                        </Grid>
                    </Grid >
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
                                } else if (e.deltaY < 0) {
                                    this.setState({
                                        scrollOffset: Math.max(0, Math.min(rowsCount - this.props.viewRowCount!, this.state.scrollOffset - step))
                                    })
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
        </>
    }
    //
    // #endregion
    //--------------------------------------------    
}

export default WSEditor;