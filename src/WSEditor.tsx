import * as React from "react";
import { Grid, Checkbox, FormControlLabel, withStyles, InputBase, Typography, Slider } from '@material-ui/core';
import { GridJustification, GridItemsAlignment } from "@material-ui/core/Grid";
import * as icons from '@material-ui/icons';
import { CSSProperties } from "@material-ui/styles";
import { WSEditorCellEditor } from "./WSEditorCellEditor";
import { WSEditorRow } from "./WSEditorRow";

//-----------------------------------------------------------------------------------------------

export enum SortDirection { Ascending, Descending };

//-----------------------------------------------------------------------------------------------

export enum WSEditorSelectMode {
    Cell,
    Row
}

//-----------------------------------------------------------------------------------------------

export interface WSEditorRowProps<T> {
    viewRowIdx: number;
    editor: WSEditor<T>;
}

//-----------------------------------------------------------------------------------------------



//-----------------------------------------------------------------------------------------------

export class WSEditorCellCoord<T> {
    private _rowIdx: number;
    private _colIdx: number;

    constructor(rowIdx: number, colIdx: number) {
        this._rowIdx = rowIdx;
        this._colIdx = colIdx;
    }

    get rowIdx() { return this._rowIdx; }
    get colIdx() { return this._colIdx; }

    getCol(editor: WSEditor<T>) { return editor.props.cols[this._colIdx]; }
    getRow(editor: WSEditor<T>) { return editor.props.rows[this._rowIdx]; }

    getViewCellCoord = (scrollOffset: number) => new WSEditorViewCellCoord<T>(this._rowIdx - scrollOffset, this._colIdx);

    key = () => this._rowIdx + "_" + this._colIdx;

    lessThan(other: WSEditorCellCoord<T>) {
        return this.rowIdx < other.rowIdx || (this.rowIdx === other.rowIdx && this.colIdx < other.colIdx);
    }

    greatThan(other: WSEditorCellCoord<T>) {
        return this.rowIdx > other.rowIdx || (this.rowIdx === other.rowIdx && this.colIdx > other.colIdx);
    }

    equals(other: WSEditorCellCoord<T>) {
        return this.rowIdx === other.rowIdx && this.colIdx === other.colIdx;
    }

    toString() { return this._rowIdx + ":" + this._colIdx; }
}

//-----------------------------------------------------------------------------------------------



//-----------------------------------------------------------------------------------------------

export interface WSEditorCellEditorBooleanOpts {
    label?: React.ReactNode;
    labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
    //controlJustify?: GridJustification;
}

//-----------------------------------------------------------------------------------------------



//-----------------------------------------------------------------------------------------------

export function WSEditorCellEditorDefaultProps() {
    return {
        justify: "center",
        alignItems: "center"
    } as WSEditorCellEditorPropsOpts
}

//-----------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------



//-----------------------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------------------

export interface WSEditorCellEditorProps<T> extends WSEditorCellEditorPropsOpts {
    data: any;
    cellContainerStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>, defaultStyle: React.CSSProperties) => React.CSSProperties;
    cellControlStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>, defaultStyle: React.CSSProperties) => React.CSSProperties;
}

//-----------------------------------------------------------------------------------------------

export interface WSEditorCellEditorPropsOpts {
    justify?: GridJustification;
    alignItems?: GridItemsAlignment;
}

//-----------------------------------------------------------------------------------------------

export interface WSEditorColumn<T> {
    header: string;
    field: keyof T | undefined;
    defaultEditor?: "text-readonly" | "text" | "boolean" | "number";
    editor?: (props: WSEditorCellEditorProps<T>, editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => WSEditorCellEditor<T>;
    /** set from editor */
    viewColIdx?: number;
    sortDir?: SortDirection;
    sortOrder?: number;
    sortFn?: (a: T, b: T, dir: SortDirection) => number;
    readonly?: boolean;
    minWidth?: number | string;
    maxWidth?: number | string;
    width?: number | string;
    cellContainerStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    cellControlStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    justify?: GridJustification;
    alignItems?: GridItemsAlignment;
    colHeader?: WSEditorColumnHeader<T>;
}

//-----------------------------------------------------------------------------------------------

export interface WSEditorColumnHeaderState {
    currentWidth: number;
}

//-----------------------------------------------------------------------------------------------

export class WSEditorColumnHeader<T> extends React.Component<WSEditorColumnHeaderProps<T>, WSEditorColumnHeaderState>
{
    viewRowIdx: number = -1;
    containerRef: React.RefObject<HTMLDivElement>;

    constructor(props: WSEditorColumnHeaderProps<T>) {
        super(props);

        this.state = {
            currentWidth: 0
        };
        this.containerRef = React.createRef();
    }

    toggleSort(shiftPressed: boolean) {
        this.props.editor.toggleColumnHeaderSort(this, shiftPressed);
    }

    render(key?: string | number | undefined) {
        if (this.containerRef && this.containerRef.current) {
            const colCurrentWidth = this.containerRef.current.clientWidth;
            if (colCurrentWidth > 0 && colCurrentWidth !== this.state.currentWidth) {
                this.setState({ currentWidth: colCurrentWidth });
            }
        }

        const col = this.props.col;
        const viewCell = new WSEditorViewCellCoord<T>(-1, this.props.cIdx);

        const defaultHeaderCellStyle = WSEditor.defaultProps.headerCellStyle!(this.props);
        const defaultContainerStyle = WSEditor.defaultProps.cellContainerStyle!(this.props.editor, viewCell);
        const containerStyle = Object.assign({},
            defaultContainerStyle,
            this.props.editor.props.cellContainerStyle ? this.props.editor.props.cellContainerStyle!(this.props.editor, viewCell) : {},
            col.cellContainerStyle ? col.cellContainerStyle!(this.props.editor, viewCell) : {},
            defaultHeaderCellStyle,
            {
                minWidth: this.props.col.minWidth ? this.props.col.minWidth : "",
                maxWidth: this.props.col.maxWidth ? this.props.col.maxWidth : "",
                width: this.props.col.width ? this.props.col.width : "",
            },
            this.props.editor.props.headerCellStyle ? this.props.editor.props.headerCellStyle!(this.props) : {},
        );

        const defaultHeaderControlStyle = WSEditor.defaultProps.headerControlStyle!(this.props);
        const controlStyle = Object.assign({},
            defaultHeaderControlStyle,
            this.props.editor.props.headerControlStyle ? this.props.editor.props.headerControlStyle!(this.props) : {});

        return <Grid
            xs
            key={key}
            onMouseDown={(e) => { this.toggleSort(e.getModifierState("Shift")); e.preventDefault(); }}
            item={true}
            ref={this.containerRef}
            style={containerStyle} >
            <Grid container direction="row">
                <Grid item={true} xs>
                    <Typography style={controlStyle}>
                        <b>{this.props.col.header}</b>
                    </Typography>
                </Grid>
                <Grid item={true} xs="auto">
                    <Typography style={controlStyle}>
                        {this.props.col.sortDir === SortDirection.Ascending ? <icons.ArrowUpward fontSize="small" /> :
                            (this.props.col.sortDir === SortDirection.Descending ? <icons.ArrowDownward fontSize="small" /> : null)}
                    </Typography>
                </Grid>
            </Grid>
        </Grid >
    }
}

//-----------------------------------------------------------------------------------------------

export interface WSEditorColumnHeaderProps<T> {
    editor: WSEditor<T>;
    col: WSEditorColumn<T>;
    cIdx: number;
}

//-----------------------------------------------------------------------------------------------

export function WSEditorDefaultProps() {
    return {
        viewRowCount: 10,
        viewRowCountFixed: false,
        selectionMode: WSEditorSelectMode.Cell,
        selectionModeMulti: true,
        readonly: false,
        hideSlider: false,
        //cellMargin: 2,
        sliderWheelDivisionStep: 15,
        debug: false,
        width: "100%",

        gridCellStyle: (editor, viewCell) => {
            return {
                outline: 0,
                margin: "0px",
                borderLeft: "1px solid transparent",
                borderTop: "1px solid transparent",
                borderRight: viewCell.viewColIdx !== editor.props.cols.length - 1 ? "1px solid #eeeeee" : "0",
                borderBottom: "1px solid #eeeeee",
                overflow: "hidden", textOverflow: "ellipsis"
            }
        },
        gridCellFocusedStyle: (editor, viewCell) => {
            return {
                border: "1px solid rgba(56,90,162,0.8)"
            }
        },
        gridRowFocusedStyle: (editor, viewCell) => {
            return {
                borderTop: "1px solid rgba(56,90,162,0.8)",
                borderBottom: "1px solid rgba(56,90,162,0.8)",
                borderRight: viewCell.viewColIdx === editor.props.cols.length - 1 ? "1px solid rgba(56,90,162,0.8)" : "1px solid transparent",
                borderLeft: viewCell.viewColIdx === 0 ? "1px solid rgba(56,90,162,0.8)" : "1px solid transparent",
            }
        },
        selectionStyle: (editor, viewCell) => {
            return {
                background: "rgba(56,90,162,0.2)",
                outline: 0,
                overflow: "hidden", textOverflow: "ellipsis"
            }
        },
        cellContainerHoverStyle: (editor, viewCell) => {
            return {
                // background: "rgba(56,90,162,0.1)"
            }
        },
        cellContainerStyle: (editor, viewCell) => {
            return {
                verticalAlign: "middle",
            }
        },
        cellControlStyle: (editor, viewCell) => {
            return {
                margin: "5px",
            }
        },

        headerCellStyle: (props) => {
            return {
                margin: 0,
                padding: "5px",
                background: "#eeeeee",
                borderStyle: "solid",
                borderLeft: "0px solid #a0a0a0",
                borderTop: "0px solid #a0a0a0",
                borderRight: props.cIdx !== props.editor.props.cols.length - 1 ? "1px solid #a0a0a0" : "0",
                borderBottom: "1px solid #a0a0a0",
                cursor: "pointer",
                overflow: "hidden", textOverflow: "ellipsis"
            }
        },
        headerControlStyle: (props) => {
            return {
                lineHeight: undefined,
                margin: "5px",
            }
        },
        frameStyle: {
            borderTop: 0,
            overflow: "auto",
            border: "1px solid #a0a0a0",
            //padding: 1                       
        },
    } as WSEditorPropsOpts<any>
}

//-----------------------------------------------------------------------------------------------

export interface WSEditorProps<T> extends WSEditorPropsOpts<T> {
    rows: T[];
    setRows: (newRows: any[]) => void;
    cols: WSEditorColumn<T>[];
    setCols: (newCols: WSEditorColumn<any>[]) => void;

    onCellDataChanged?: (editor: WSEditor<T>, rowData: T, cell: WSEditorCellCoord<T>, newData: any) => void;
    onSelectionChanged?: (editor: WSEditor<T>, selection: WSEditorSelection<T>) => void;
    onCellClicked?: (editor: WSEditor<T>, cell: WSEditorCellCoord<T>, e: React.MouseEvent<HTMLDivElement>) => void;
    onCellDoubleClicked?: (editor: WSEditor<T>, cell: WSEditorCellCoord<T>, e: React.MouseEvent<HTMLDivElement>) => void;
    onRowsAdded?: (editor: WSEditor<T>, rows: WSEditorRowInfo<T>[]) => void;
    onRowsDeleted?: (editor: WSEditor<T>, rows: WSEditorRowInfo<T>[]) => void;
    onKeyDown?: (editor: WSEditor<T>, cell: WSEditorCellCoord<T>, e: React.KeyboardEvent<HTMLDivElement>) => void;
}

//-----------------------------------------------------------------------------------------------

export interface WSEditorPropsOpts<T> {
    viewRowCount?: number;
    viewRowCountFixed?: boolean;
    selectionMode?: WSEditorSelectMode;
    selectionModeMulti?: boolean;
    readonly?: boolean;
    hideSlider?: boolean;
    //cellMargin?: string | number;
    sliderWheelDivisionStep?: number;
    debug?: boolean;
    width?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
    gridCellStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    gridCellFocusedStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    gridRowFocusedStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    selectionStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    cellContainerHoverStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    cellContainerStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    cellControlStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    headerCellStyle?: (props: WSEditorColumnHeaderProps<T>) => React.CSSProperties;
    headerControlStyle?: (props: WSEditorColumnHeaderProps<T>) => React.CSSProperties;
    frameStyle?: React.CSSProperties;
}

//-----------------------------------------------------------------------------------------------

export interface WSEditorStatus<T> {
    scrollOffset: number;
    focusedViewCell: WSEditorViewCellCoord<T>;
    directEditingViewCell: WSEditorViewCellCoord<T>;
    hoverViewRowIdx: number;
    headerRowHeight: number;
    gridHeight: number;
    selection: WSEditorSelection<T>;
}

//-----------------------------------------------------------------------------------------------

export interface WSEditorRowInfo<T> {
    rowIdx: number;
    row: T;
}

//-----------------------------------------------------------------------------------------------

export class WSEditor<T> extends React.PureComponent<WSEditorProps<T>, WSEditorStatus<T>>
{
    headerRowRef: React.RefObject<HTMLDivElement>;
    scrollableRef: React.RefObject<HTMLDivElement>;
    gridRef: React.RefObject<HTMLDivElement>;

    static defaultProps = WSEditorDefaultProps();

    constructor(props: WSEditorProps<T>) {
        super(props);

        this.headerRowRef = React.createRef();
        this.scrollableRef = React.createRef();
        this.gridRef = React.createRef();

        this.state = {
            scrollOffset: 0,
            focusedViewCell: new WSEditorViewCellCoord<T>(-1, -1),
            directEditingViewCell: new WSEditorViewCellCoord<T>(-1, -1),
            hoverViewRowIdx: -1,
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

            const colHeader = new WSEditorColumnHeader<T>({
                editor: this,
                col: col,
                cIdx: cIdx
            });

            col.colHeader = colHeader;

            const hCTL = colHeader.render("col:" + cIdx);

            res.push(hCTL);
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

    componentDidMount() {
        let hrh = this.state.headerRowHeight;

        if (this.headerRowRef && this.headerRowRef.current) {
            hrh = this.headerRowRef.current.clientHeight;
            //this.setState({ headerRowHeight: this.headerRowRef.current.clientHeight });
        }
        this.recomputeGridHeight(hrh);

        window.addEventListener("resize", () => {
            hrh = this.state.headerRowHeight;

            if (this.headerRowRef && this.headerRowRef.current) {
                hrh = this.headerRowRef.current.clientHeight;
                //this.setState({ headerRowHeight: this.headerRowRef.current.clientHeight });
            }
            this.recomputeGridHeight(hrh);
        });
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

        return <div>
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
                        style={this.props.frameStyle}>
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
                                {this.renderRows()}
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

//-----------------------------------------------------------------------------------------------

export interface WSEditorRowInfo<T> {
    rowIdx: number;
    row: T;
}

//-----------------------------------------------------------------------------------------------

export class WSEditorSelectionBounds<T> {
    private _minRowIdx: number;
    private _minColIdx: number;
    private _maxRowIdx: number;
    private _maxColIdx: number;

    get minRowIdx() { return this._minRowIdx; }
    get minColIdx() { return this._minColIdx; }
    get maxRowIdx() { return this._maxRowIdx; }
    get maxColIdx() { return this._maxColIdx; }

    constructor(rng: WSEditorSelectionRange<T>) {
        this._minRowIdx = rng.from.rowIdx < rng.to.rowIdx ? rng.from.rowIdx : rng.to.rowIdx;
        this._minColIdx = rng.from.colIdx < rng.to.colIdx ? rng.from.colIdx : rng.to.colIdx;
        this._maxRowIdx = rng.from.rowIdx > rng.to.rowIdx ? rng.from.rowIdx : rng.to.rowIdx;
        this._maxColIdx = rng.from.colIdx > rng.to.colIdx ? rng.from.colIdx : rng.to.colIdx;
    }

    /** return new bound that extends this one to given other */
    union(other: WSEditorSelectionBounds<T>) {
        return new WSEditorSelectionBounds<T>(
            new WSEditorSelectionRange<T>(
                new WSEditorCellCoord<T>(
                    this._minRowIdx < other._minRowIdx ? this._minRowIdx : other._minRowIdx,
                    this._minColIdx > other._minColIdx ? this._minColIdx : other._minColIdx),
                new WSEditorCellCoord<T>(
                    this._maxRowIdx > other._maxRowIdx ? this._maxRowIdx : other._maxRowIdx,
                    this._maxColIdx > other._maxColIdx ? this._maxColIdx : other._maxColIdx)));
    }

    contains(cell: WSEditorCellCoord<T>) {
        return cell.rowIdx >= this._minRowIdx && cell.rowIdx <= this._maxRowIdx &&
            cell.colIdx >= this._minColIdx && cell.colIdx <= this._maxColIdx;
    }
}

//-----------------------------------------------------------------------------------------------

export class WSEditorSelectionRange<T>
{
    private _from: WSEditorCellCoord<T>;
    private _to: WSEditorCellCoord<T>;

    get from() { return this._from; }
    get to() { return this._to; }

    /** compute this range bounds */
    get bounds(): WSEditorSelectionBounds<T> { return new WSEditorSelectionBounds<T>(this); }

    constructor(from: WSEditorCellCoord<T>, to: WSEditorCellCoord<T>) {
        this._from = from;
        this._to = to;
    }

    /** returns copy of this */
    dup() {
        return new WSEditorSelectionRange<T>(this.from, this.to);
    }

    contains(other: WSEditorCellCoord<T>, rowMode: boolean = false) {
        if (rowMode === true) {
            let minRow = this._from.rowIdx;
            let maxRow = this._to.rowIdx;
            if (maxRow < minRow) {
                let x = minRow;
                minRow = maxRow;
                maxRow = x;
            }
            return minRow <= other.rowIdx && other.rowIdx <= maxRow;
        }
        else
            return this.bounds.contains(other);
    }

    toString() {
        if (this._from.equals(this._to))
            return "(" + this._from.toString() + ")";
        else
            return "(" + this.from.toString() + ")-(" + this.to.toString() + ")";
    }

    *cells() {
        const bound = this.bounds;

        for (let ri = bound.minRowIdx; ri <= bound.maxRowIdx; ++ri) {
            for (let ci = bound.minColIdx; ci <= bound.maxColIdx; ++ci) {
                yield new WSEditorCellCoord<T>(ri, ci);
            }
        }
    }
}

//-----------------------------------------------------------------------------------------------

export class WSEditorSelection<T> {

    private editor: WSEditor<T>;
    private _ranges: WSEditorSelectionRange<T>[];

    constructor(editor: WSEditor<T>, ranges: WSEditorSelectionRange<T>[]) {
        this.editor = editor;
        this._ranges = ranges;
    }

    get ranges() { return this._ranges; }

    get bounds() {
        if (this._ranges.length === 0)
            return null;
        else {
            let res = this._ranges[0].bounds;
            for (let i = 1; i < this._ranges.length; ++i) {
                const b = this._ranges[i].bounds;
                res = res.union(b);
            }
            return res;
        }
    }

    /** return copy of this */
    dup(): WSEditorSelection<T> {
        return new WSEditorSelection<T>(this.editor, this._ranges.map((r) => r.dup()));
    }

    add(cell: WSEditorCellCoord<T>) {
        const res = this.dup();

        res.ranges.push(new WSEditorSelectionRange(cell, cell));

        return res;
    }

    /** create a copy of this with last range extends to given cell */
    extendsTo(cell: WSEditorCellCoord<T>) {
        const res = this.dup();

        const lastrng = res.ranges[res.ranges.length - 1];
        res.ranges.splice(res.ranges.length - 1, 1);

        const newRng = new WSEditorSelectionRange(lastrng.from, cell);
        res.ranges.push(newRng);

        return res;
    }

    setSelection(range: WSEditorSelectionRange<T>) {
        this._ranges = [range];
    }

    /** if row mode selection extends automatically to entire row containing selected cells */
    containsViewcell(viewCell: WSEditorViewCellCoord<T>): boolean {
        const cell = viewCell.getCellCoord(this.editor.state.scrollOffset);

        return this._ranges.find((w) => w.contains(cell, this.editor.props.selectionMode === WSEditorSelectMode.Row)) !== undefined;
    }

    *cells() {
        for (let rngIdx = 0; rngIdx < this._ranges.length; ++rngIdx) {
            const rng = this._ranges[rngIdx];
            let rngCells = rng.cells();
            let cell = rngCells.next();
            while (!cell.done) {
                yield cell.value;
                cell = rngCells.next();
            }
        }
    }

    rowIdxs() {
        let res: Set<number> = new Set<number>();

        for (let rngIdx = 0; rngIdx < this._ranges.length; ++rngIdx) {
            const rng = this._ranges[rngIdx];
            let rngCells = rng.cells();
            let cell = rngCells.next();
            while (!cell.done) {
                res.add(cell.value.rowIdx);
                cell = rngCells.next();
            }
        }

        return res;
    }

    toString() {
        let str = "";
        for (let i = 0; i < this.ranges.length; ++i) {
            if (i > 0) str += " ; "
            str += this.ranges[i].toString();
        }

        return str;
    }

}

//-----------------------------------------------------------------------------------------------

export class WSEditorViewCellCoord<T> {
    private _viewRowIdx: number;
    private _viewColIdx: number;

    constructor(viewRowIdx: number, viewColIdx: number) {
        this._viewRowIdx = viewRowIdx;
        this._viewColIdx = viewColIdx;
    }

    get viewRowIdx() { return this._viewRowIdx; }
    get viewColIdx() { return this._viewColIdx; }

    getCol(editor: WSEditor<T>) { return editor.props.cols[this._viewColIdx]; }
    getRow(editor: WSEditor<T>) { return editor.props.rows[this.getCellCoord(editor.state.scrollOffset).rowIdx]; }

    getCellCoord = (scrollOffset: number) => new WSEditorCellCoord<T>(scrollOffset + this._viewRowIdx, this._viewColIdx);

    key = () => this._viewRowIdx + "_" + this._viewColIdx;

    lessThan(other: WSEditorViewCellCoord<T>) {
        return this.viewRowIdx < other.viewRowIdx || (this.viewRowIdx === other.viewRowIdx && this.viewColIdx < other.viewColIdx);
    }

    greatThan(other: WSEditorViewCellCoord<T>) {
        return this.viewRowIdx > other.viewRowIdx || (this.viewRowIdx === other.viewRowIdx && this.viewColIdx > other.viewColIdx);
    }

    equals(other: WSEditorViewCellCoord<T>) {
        return this.viewRowIdx === other.viewRowIdx && this.viewColIdx === other.viewColIdx;
    }

    toString() {
        return this.key();
    }
}

//-----------------------------------------------------------------------------------------------

export * from './WSEditorCellEditor';
export * from './WSEditorCellEditorBoolean';
export * from './WSEditorCellEditorNumber';
export * from './WSEditorCellEditorText';
