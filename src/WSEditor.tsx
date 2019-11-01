import * as React from "react";
import { Grid, Checkbox, FormControlLabel, withStyles, InputBase, Typography, Slider } from '@material-ui/core';
import { GridJustification, GridItemsAlignment } from "@material-ui/core/Grid";
import * as icons from '@material-ui/icons';

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

export class WSEditorRow<T> extends React.Component<WSEditorRowProps<T>>
{
    // constructor(props: WSEditorRowProps<T>) {
    //     super(props);
    // }

    handleClick = (e: React.MouseEvent<HTMLDivElement>, viewCell: WSEditorViewCellCoord<T>) => {
        const cell = viewCell.getCellCoord(this.props.editor.state.scrollOffset);
        if (this.props.editor.props.onCellClicked) this.props.editor.props.onCellClicked(this.props.editor, cell, e);
        if (e.defaultPrevented) return;

        const shift_key = e.getModifierState("Shift");
        const ctrl_key = e.getModifierState("Control");

        if (!viewCell.equals(this.props.editor.state.focusedViewCell)) {
            this.props.editor.setCurrentCell(
                cell,
                shift_key === true, // endingCell
                ctrl_key === false // clearPrevious
            );
        }
    }

    handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>, viewCell: WSEditorViewCellCoord<T>) => {
        const cell = viewCell.getCellCoord(this.props.editor.state.scrollOffset);
        if (this.props.editor.props.onCellDoubleClicked) this.props.editor.props.onCellDoubleClicked(this.props.editor, cell, e);
        if (e.defaultPrevented) return;
    }

    handleWheel = (e: React.WheelEvent<HTMLDivElement>, evtviewCell: WSEditorViewCellCoord<T>) => {
        const shift_key = e.getModifierState("Shift");

        if (!shift_key) {
            let inc = 0;
            if (e.deltaY > 0) inc = 1;
            else if (e.deltaY < 0) inc = -1;

            const cell = this.props.editor.state.focusedViewCell.getCellCoord(this.props.editor.state.scrollOffset);
            if (cell.rowIdx + inc >= 0 && cell.rowIdx + inc < this.props.editor.props.rows.length)
                this.props.editor.setCurrentCell(new WSEditorCellCoord(cell.rowIdx + inc, cell.colIdx), false, true);
        }
    }

    handleMouseOver = (e: React.MouseEvent<HTMLDivElement>, evtviewCell: WSEditorViewCellCoord<T>) => {
        this.props.editor.setHoverViewRowIdx(evtviewCell.viewRowIdx);
    }

    rowHandleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, viewCell: WSEditorViewCellCoord<T>) => {
        const cell = viewCell.getCellCoord(this.props.editor.state.scrollOffset);
        if (this.props.editor.props.onKeyDown) this.props.editor.props.onKeyDown(this.props.editor, cell, e);
        if (e.defaultPrevented) return;

        const ctrl_key = e.getModifierState("Control");
        const shift_key = e.getModifierState("Shift");

        let shiftHandled = false;
        let keyHandled = true;
        let focusCell = true;
        const rowsCount = this.props.editor.props.rows.length;
        const viewRowsCount = this.props.editor.props.viewRowCount;
        const colsCount = this.props.editor.props.cols.length;

        const cellEditor = this.props.editor.getCellEditor(viewCell);

        let newRowIdx = cell.rowIdx;
        let newColIdx = cell.colIdx;

        if (e.key === "ArrowDown") {
            if (ctrl_key)
                newRowIdx = rowsCount - 1;
            else
                newRowIdx++;
        }
        else if (e.key === "PageDown") {
            newRowIdx += viewRowsCount!;
        }
        else if (e.key === "ArrowUp") {
            if (ctrl_key)
                newRowIdx = 0;
            else
                newRowIdx--;
        }
        else if (e.key === "PageUp") {
            newRowIdx -= viewRowsCount!;
        }
        else if (e.key === "ArrowRight") {
            if (ctrl_key)
                newColIdx = colsCount - 1;
            else
                ++newColIdx;
        } else if (e.key === "ArrowLeft") {
            if (ctrl_key)
                newColIdx = 0;
            else
                --newColIdx;
        } else if (e.key === "Home") {
            if (ctrl_key) {
                newRowIdx = 0;
                newColIdx = 0;
            } else
                newColIdx = 0;
        } else if (e.key === "End") {
            if (ctrl_key) {
                newRowIdx = rowsCount - 1;
                newColIdx = colsCount - 1;
            }
            else
                newColIdx = colsCount - 1;
        } else if (e.key === "Enter") {
            ++newRowIdx;
        } else if (e.key === "Delete") {
            let cells = this.props.editor.state.selection.cells();
            let cell = cells.next();
            while (!cell.done) {
                this.props.editor.setCellData(cell.value, "");
                cell = cells.next();
            }
        } else if (e.key === "Tab") {
            if (shift_key) {
                if (newRowIdx !== 0 || newColIdx !== 0) {
                    if (newColIdx - 1 >= 0) {
                        --newColIdx;
                    } else {
                        --newRowIdx;
                        newColIdx = colsCount - 1;
                    }
                }
                shiftHandled = true;
            } else if (newRowIdx !== rowsCount - 1 || newColIdx !== colsCount - 1) {
                if (newColIdx + 1 < colsCount) {
                    ++newColIdx;
                } else {
                    ++newRowIdx;
                    newColIdx = 0;
                }
            }
        } else if (e.key === "Escape" ||
            e.key === "F1" || e.key === "F3" || e.key === "F4" || e.key === "F5" || e.key === "F6" ||
            e.key === "F7" || e.key === "F8" || e.key === "F9" || e.key === "F10" || e.key === "F11" || e.key === "F12") {
        } else if (e.key === "F2") {
            this.props.editor.focusCellEditor(viewCell);
            focusCell = false;
        } else
            keyHandled = false;

        if (keyHandled) {
            if (this.props.editor.state.hoverViewRowIdx !== newRowIdx) this.props.editor.setHoverViewRowIdx(-1);

            if (newRowIdx < 0) newRowIdx = 0;
            else if (newRowIdx >= rowsCount) newRowIdx = rowsCount - 1;

            if (newColIdx < 0) newColIdx = 0;
            else if (newColIdx >= colsCount) newColIdx = colsCount - 1;

            if (focusCell) this.props.editor.setCurrentCell(new WSEditorCellCoord<T>(newRowIdx, newColIdx), shift_key && !shiftHandled);
            e.preventDefault();
            if (newColIdx === 0 && this.props.editor.scrollableRef.current && this.props.editor.scrollableRef.current.scrollLeft !== 0) {
                const el = this.props.editor.scrollableRef.current;
                el.scrollTo(0, el.scrollTop);
            }
        } else if (cellEditor) {
            if (e.key !== "Control" && e.key !== "Shift" && e.key !== "Alt" && e.key !== "Meta")
                cellEditor.handleKeyDown(this, viewCell, e);
        }
    }

    handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, viewCell: WSEditorViewCellCoord<T>) => {
        const cellEditor = this.props.editor.getCellEditor(viewCell);
        const cellEditorFocused = cellEditor && cellEditor.isFocused();

        if (cellEditorFocused && cellEditor)
            cellEditor.handleKeyDown(this, viewCell, e);
        else
            this.rowHandleKeyDown(e, viewCell);
    }

    renderRow() {
        const res: React.ReactNode[] = [];

        for (let cIdx = 0; cIdx < this.props.editor.props.cols.length; ++cIdx) {
            const col = this.props.editor.props.cols[cIdx];
            const viewCell = new WSEditorViewCellCoord<T>(this.props.viewRowIdx, col.viewColIdx!);
            const editor = this.props.editor;

            const selectionStyleDefault = WSEditor.defaultProps.selectionStyle!(editor, viewCell);
            const gridCellStyle = Object.assign({},
                {
                    minWidth: col.minWidth ? col.minWidth : "",
                    maxWidth: col.maxWidth ? col.maxWidth : "",
                    width: col.width ? col.width : (col.colHeader ? col.colHeader.state.currentWidth : ""),
                    outline: 0,
                    margin: "0px"
                },
                editor.selectionContains(viewCell) ?
                    Object.assign(selectionStyleDefault, editor.props.selectionStyle!(editor, viewCell)) : {},
                editor.state.focusedViewCell.viewRowIdx === viewCell.viewRowIdx ?
                    (editor.props.selectionMode === WSEditorSelectMode.Row ?
                        editor.props.gridRowFocusedStyle!(editor, viewCell)
                        : viewCell.equals(editor.state.focusedViewCell) ?
                            editor.props.gridCellFocusedStyle!(editor, viewCell) :
                            WSEditor.defaultProps.gridCellStyle!(editor, viewCell)
                    ) : WSEditor.defaultProps.gridCellStyle!(editor, viewCell),
                this.props.viewRowIdx === editor.state.hoverViewRowIdx &&
                    !editor.state.selection.containsViewcell(viewCell) ?
                    editor.props.cellContainerHoverStyle!(editor, viewCell) : {}
            );

            const cellEditorProps = {
                data: editor.getCellData(viewCell),
                cellContainerStyle: col.cellContainerStyle,
                cellControlStyle: col.cellControlStyle,
                justify: col.justify ? col.justify : WSEditorCellEditor.defaultProps.justify,
                alignItems: col.alignItems ? col.alignItems : WSEditorCellEditor.defaultProps.alignItems,
            } as WSEditorCellEditorProps<T>;

            let CTL: WSEditorCellEditor<T> | undefined = undefined;

            if (col.editor)
                CTL = col.editor(cellEditorProps, editor, viewCell);
            else {
                if (col.defaultEditor) {
                    switch (col.defaultEditor) {
                        // case "text": CTL = new WSEditorCellEditorText<T>(cellEditorProps, editor, viewCell); break;
                        // case "boolean": CTL = new WSEditorCellEditorBoolean<T>(cellEditorProps, editor, viewCell); break;
                        case "text-readonly":
                        default: CTL = new WSEditorCellEditor<T>(cellEditorProps, editor, viewCell); break;
                    }
                }
                else
                    CTL = new WSEditorCellEditor<T>(cellEditorProps, editor, viewCell);
            }

            const CTLX = CTL!;

            res.push(<Grid
                container
                direction="row"
                justify={CTLX.props.justify}
                alignItems={CTLX.props.alignItems}
                key={"c" + viewCell.key()} xs item={true}
                tabIndex={0}
                onClick={(e) => this.handleClick(e, viewCell)}
                onDoubleClick={(e) => this.handleDoubleClick(e, viewCell)}
                onKeyDown={(e) => this.handleKeyDown(e, viewCell)}
                onMouseEnter={(e) => this.handleMouseOver(e, viewCell)}
                onMouseLeave={(e) => this.props.editor.setHoverViewRowIdx(-1)}
                onWheel={(e) => this.handleWheel(e, viewCell)}
                style={gridCellStyle}
                ref={(r) => {
                    editor.setViewCellRef(viewCell, r);
                }}>
                {CTLX.render()}
            </Grid >);
        }

        return res;
    }

    render() {
        return this.renderRow()
    }
}

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

export class WSEditorCellEditor<T, S = {}> extends React.Component<WSEditorCellEditorProps<T>, S>
{
    editor: WSEditor<T>;
    viewCell: WSEditorViewCellCoord<T>;
    customControlRender?: (cellEditor: WSEditorCellEditor<T, S>, row: T) => JSX.Element;
    private directEditing: boolean = true;

    static defaultProps = WSEditorCellEditorDefaultProps();

    constructor(props: WSEditorCellEditorProps<T>, editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>,
        customRender?: (cellEditor: WSEditorCellEditor<T, S>, row: T) => JSX.Element) {
        super(props);

        this.editor = editor;
        this.viewCell = viewCell;
        this.customControlRender = customRender;
        this.editor.setCellEditor(viewCell, this);
    }

    handleKeyDown(rowEditor: WSEditorRow<T>, viewCell: WSEditorViewCellCoord<T>, e: React.KeyboardEvent<HTMLDivElement>) {
    }

    focus() {
    }

    isFocused() {
        return false;
    }

    setDirectEditing(isDirect: boolean) {
        this.directEditing = isDirect;
    }

    isDirectEditing() { return this.directEditing; }

    setData(newData: any) {
        if (this.editor.props.readonly === true || this.getCol().readonly === true) return;
        this.editor.setViewCellData(this.viewCell, newData);
    }

    getRow = () => this.viewCell.getRow
    getCol = () => this.editor.props.cols[this.viewCell.viewColIdx];

    leaveCellEdit() {
        this.editor.leaveCellEdit(this.viewCell);
        this.setDirectEditing(true);
    }

    cellContentRender() {
        const col = this.getCol();

        const defaultContainerStyle = WSEditor.defaultProps.cellContainerStyle!(this.editor, this.viewCell);
        const containerStyle = Object.assign({},
            defaultContainerStyle,
            this.editor.props.cellContainerStyle ? this.editor.props.cellContainerStyle!(this.editor, this.viewCell) : {},
            col.cellContainerStyle ? col.cellContainerStyle!(this.editor, this.viewCell) : {}
        );

        const defaultControlStyle = WSEditor.defaultProps.cellControlStyle!(this.editor, this.viewCell);
        const controlStyle = Object.assign({},
            defaultControlStyle,
            this.editor.props.cellControlStyle ? this.editor.props.cellControlStyle!(this.editor, this.viewCell) : {},
            col.cellControlStyle ? col.cellControlStyle!(this.editor, this.viewCell) : {},
            { cursor: "default" });

        return <div style={containerStyle}>
            {this.customControlRender ?
                this.customControlRender(this, this.viewCell.getRow(this.editor)) :
                <div style={controlStyle}>
                    {this.props.data}
                </div>
            }
        </div>
    }

    onMousedown(e: React.MouseEvent<HTMLDivElement>) {
        if (!this.editor.state.focusedViewCell.equals(this.viewCell)) e.preventDefault();
    }

    render() {
        return <Grid item={true}
            onMouseDown={(e) => this.onMousedown(e)}>
            {this.cellContentRender()}
        </Grid>
    }
}

//-----------------------------------------------------------------------------------------------

export interface WSEditorCellEditorBooleanOpts {
    label?: React.ReactNode;
    labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
    //controlJustify?: GridJustification;
}

//-----------------------------------------------------------------------------------------------

export class WSEditorCellEditorBoolean<T> extends WSEditorCellEditor<T>
{
    cbRef: HTMLButtonElement | null = null;
    opts?: WSEditorCellEditorBooleanOpts;

    constructor(props: WSEditorCellEditorProps<T>, editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>,
        opts?: WSEditorCellEditorBooleanOpts) {
        super(props, editor, viewCell);
        this.opts = opts;
    }

    isFocused() {
        return false;
    }

    toggle() {
        this.editor.setViewCellData(this.viewCell, !this.props.data);
    }

    handleKeyDown(rowEditor: WSEditorRow<T>, viewCell: WSEditorViewCellCoord<T>, e: React.KeyboardEvent<HTMLDivElement>) {
        super.handleKeyDown(rowEditor, viewCell, e);

        if (this.cbRef) {
            if (e.key === " ") {
                this.toggle();
                e.preventDefault();
            }
        }
    }

    cellContentRender() {
        const col = this.getCol();

        const defaultContainerStyle = WSEditor.defaultProps.cellContainerStyle!(this.editor, this.viewCell);
        const containerStyle = Object.assign({},
            defaultContainerStyle,
            this.editor.props.cellContainerStyle ? this.editor.props.cellContainerStyle!(this.editor, this.viewCell) : {},
            col.cellContainerStyle ? col.cellContainerStyle!(this.editor, this.viewCell) : {}
        );

        const defaultControlStyle = WSEditor.defaultProps.cellControlStyle!(this.editor, this.viewCell);
        if (this.editor.props.readonly === true || this.editor.props.cols[this.viewCell.viewColIdx].readonly === true) {
            const controlStyle = Object.assign({},
                defaultControlStyle,
                this.editor.props.cellControlStyle ? this.editor.props.cellControlStyle!(this.editor, this.viewCell) : {},
                col.cellControlStyle ? col.cellControlStyle!(this.editor, this.viewCell) : {});

            return <div style={containerStyle}>
                {this.props.data === true ? <icons.Done style={controlStyle} /> : this.props.data !== false ? "-" : ""}
            </div>
        }
        else {
            const ctl = <Checkbox
                icon={<icons.CheckBoxOutlineBlank style={{ fontSize: 20 }} />}
                checkedIcon={<icons.CheckBox style={{ fontSize: 20 }} />}
                ref={(h: HTMLButtonElement) => this.cbRef = h}
                checked={this.props.data}
                onChange={(e) => { this.setData(e.target.checked) }}
            />;

            const controlStyle = Object.assign({},
                defaultControlStyle,
                this.editor.props.cellControlStyle ? this.editor.props.cellControlStyle!(this.editor, this.viewCell) : {},
                col.cellControlStyle ? col.cellControlStyle!(this.editor, this.viewCell) : {},
            );

            return <div style={controlStyle}>
                {(this.opts && this.opts.label) ?
                    <FormControlLabel
                        control={ctl}
                        labelPlacement={this.opts.labelPlacement}
                        label={this.opts.label}
                    />
                    :
                    ctl}
            </div>
        }
    }
}

//-----------------------------------------------------------------------------------------------

export function WSEditorCellEditorDefaultProps() {
    return {
        justify: "center",
        alignItems: "center"
    } as WSEditorCellEditorPropsOpts
}

//-----------------------------------------------------------------------------------------------

const CellTextField = withStyles({
    root: {
        '& input': {
            cursor: "default",
            textAlign: 'right',
            padding: 0,
            paddingRight: "10px",
        } as React.CSSProperties,
    },
    error: {
        color: 'red'
    }
})(InputBase);

//-----------------------------------------------------------------------------------------------

export class WSEditorCellEditorText<T> extends WSEditorCellEditor<T>
{
    txtboxRef: HTMLInputElement | null = null;

    // constructor(props: WSEditorCellEditorProps<T>, editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) {
    //     super(props, editor, viewCell);
    // }

    focus() {
        if (this.txtboxRef) {
            const strlen = String(this.props.data).length;
            this.txtboxRef.focus();
            this.txtboxRef.setSelectionRange(strlen, strlen);
        }
    }

    isFocused() {
        return (this.txtboxRef && document.activeElement === this.txtboxRef) || false;
    }

    handleKeyDown(rowEditor: WSEditorRow<T>, viewCell: WSEditorViewCellCoord<T>, e: React.KeyboardEvent<HTMLDivElement>) {
        super.handleKeyDown(rowEditor, viewCell, e);

        const isFocused = this.isFocused();

        if (this.txtboxRef) {
            if (this.isDirectEditing() && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
                rowEditor.rowHandleKeyDown(e, viewCell);
            }
            else if (!isFocused) {
                this.setData(e.key);
                this.focus();
                e.preventDefault();
            } else {
                if (e.key === "Escape" || e.key === "Enter" ||
                    e.key === "ArrowUp" || e.key === "ArrowDown" ||
                    e.key === "PageUp" || e.key === "PageDown") {
                    rowEditor.rowHandleKeyDown(e, viewCell);
                }
            }
        }
    }

    cellContentRender() {
        const col = this.getCol();        

        const defaultControlStyle = WSEditor.defaultProps.cellControlStyle!(this.editor, this.viewCell);
        const controlStyle = Object.assign({},
            defaultControlStyle,
            { verticalAlign: "middle", border: 0, background: "transparent", outline: 0, padding: 0, cursor: "default" },
            this.editor.props.cellControlStyle ? this.editor.props.cellControlStyle!(this.editor, this.viewCell) : {},
            col.cellControlStyle ? col.cellControlStyle!(this.editor, this.viewCell) : {},
        );

        return <div style={controlStyle}>
            <InputBase
                fullWidth
                style={controlStyle}
                inputProps={{
                    style: controlStyle
                }}
                inputRef={(h) => this.txtboxRef = h}
                value={this.props.data}
                onChange={(e) => { this.setData(e.target.value) }}
            />
        </div>
    }
}

//-----------------------------------------------------------------------------------------------

export class WSEditorCellEditorNumber<T> extends WSEditorCellEditorText<T>
{
    // constructor(props: WSEditorCellEditorProps<T>, editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) {
    //     super(props, editor, viewCell);
    // }

    isValid(newData: any) {
        const str = String(newData);
        return str.length === 0 || stringIsValidNumber(str);
    }

    cellContentRender() {
        const col = this.getCol();
        
        const defaultControlStyle = WSEditor.defaultProps.cellControlStyle!(this.editor, this.viewCell);
        const controlStyle = Object.assign({},
            defaultControlStyle,
            this.editor.props.cellControlStyle ? this.editor.props.cellControlStyle!(this.editor, this.viewCell) : {},
            col.cellControlStyle ? col.cellControlStyle!(this.editor, this.viewCell) : {},
        );

        return <div style={controlStyle}>
            <CellTextField
                fullWidth
                style={controlStyle}
                error={!this.isValid(this.props.data)}
                inputRef={(h) => this.txtboxRef = h}
                value={this.props.data}
                onChange={(e) => { this.setData(e.target.value) }}
            />
        </div>
    }
}

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
    defaultEditor?: "text-readonly" | "text" | "boolean";
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

    render() {
        if (this.containerRef && this.containerRef.current) {
            // && this.containerRef.current.clientHeight !== this.state.currentWidth
            const colCurrentWidth = this.containerRef.current.clientWidth;
            if (colCurrentWidth > 0 && colCurrentWidth !== this.state.currentWidth) {
                //console.log("setting with from " + this.state.currentWidth + " to " + colCurrentWidth);
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
            }
        },
        cellContainerHoverStyle: (editor,viewCell) => {
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

            const colHeader = new WSEditorColumnHeader<T>({
                editor: this,
                col: col,
                cIdx: cIdx
            });

            col.colHeader = colHeader;

            res.push(colHeader.render());

            // res.push(<WSEditorColumnHeader
            //     key={"col:" + cIdx} editor={this} col={col} cIdx={cIdx}
            // // containerStyle={this.props.cellContainerStyle}
            // // controlStyle={this.props.cellControlStyle}
            // // headerCellStyle={this.props.headerCellStyle}
            // />);
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

    recomputeGridHeight() {
        console.log("recompute grid height ref = " + this.gridRef + " .current=" + this.gridRef.current);
        if (this.gridRef && this.gridRef.current) {

            const children = this.gridRef.current.children;
            let realGridHeight = 0;
            console.log("children len " + children.length);
            for (let ci = 0; ci < children.length; ++ci) {
                realGridHeight += children.item(ci)!.clientHeight;
            }
            console.log("setting gridheight = " + realGridHeight);
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
        let layoutWidth: string | number | undefined = undefined;

        if (this.props.width) {
            layoutWidth = "calc(" + this.props.width + " - 24px)";
        }
        else {
            layoutWidth = "calc(100% - 24px)";
        }

        if (this.props.rows.length > 0 && this.state.gridHeight === this.state.headerRowHeight) {
            this.recomputeGridHeight();
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
                            <Grid
                                direction="column"
                                justify="flex-start"
                            >
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

export function stringIsValidNumber(n: string) {
    const q = n.match(/^[-+]?\d*(\.\d*)?([eE][-+]?\d+)?$/);    

    return (q && q.length > 0) || false;
}
