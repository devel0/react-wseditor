import {
    WSEditorRowProps, WSEditorViewCellCoord, WSEditorCellCoord, WSEditorCellEditorProps, WSEditor, WSEditorSelectMode,
    WSEditorCellEditor, WSEditorCellEditorText, WSEditorCellEditorNumber, WSEditorCellEditorBoolean
} from "./WSEditor";
import * as React from "react";
import { Grid } from "@material-ui/core";

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
            this.props.editor.unsetDirectEditing();
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
        const cellEditorFocused = cellEditor && cellEditor.getIsFocused();

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
                data: editor.getCellData(viewCell.getCellCoord(this.props.editor.state.scrollOffset)),
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
                        case "text": CTL = new WSEditorCellEditorText<T>(cellEditorProps, editor, viewCell); break;
                        case "number": CTL = new WSEditorCellEditorNumber<T>(cellEditorProps, editor, viewCell); break;
                        case "boolean": CTL = new WSEditorCellEditorBoolean<T>(cellEditorProps, editor, viewCell); break;
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
