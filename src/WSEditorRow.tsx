import * as React from "react";
import { Grid } from '@material-ui/core';
import WSEditorCellEditor from "./WSEditorCellEditor";
import WSEditor from "./WSEditor";
import WSEditorViewCellCoord from "./WSEditorViewCellCoord";
import WSEditorCellCoord from "./WSEditorCellCoord";

export interface WSEditorRowProps<T> {
    viewRowIdx: number;
    editor: WSEditor<T>;
}

class WSEditorRow<T> extends React.Component<WSEditorRowProps<T>>
{
    // constructor(props: WSEditorRowProps<T>) {
    //     super(props);
    // }

    handleMouseWheel = (e: React.WheelEvent<HTMLDivElement>, viewCell: WSEditorViewCellCoord<T>) => {
        const shift_key = e.getModifierState("Shift");

        if (!shift_key) {
            let inc = 0;
            if (e.deltaY > 0) inc = 1;
            else if (e.deltaY < 0) inc = -1;
            this.props.editor.setScrollOffset(this.props.editor.state.scrollOffset + inc);
        }
    }

    rowHandleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, viewCell: WSEditorViewCellCoord<T>) => {
        const ctrl_key = e.getModifierState("Control");
        const shift_key = e.getModifierState("Shift");

        let keyHandled = true;
        let focusCell = true;
        const rowsCount = this.props.editor.props.rows.length;
        const viewRowsCount = this.props.editor.props.viewRowCount;
        const colsCount = this.props.editor.props.cols.length;

        const cellEditor = this.props.editor.getCellEditor(viewCell);

        const cell = viewCell.getCellCoord(this.props.editor.state.scrollOffset);
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
            if (newRowIdx !== rowsCount - 1 || newColIdx !== colsCount - 1) {
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
            if (newRowIdx < 0) newRowIdx = 0;
            else if (newRowIdx >= rowsCount) newRowIdx = rowsCount - 1;

            if (newColIdx < 0) newColIdx = 0;
            else if (newColIdx >= colsCount) newColIdx = colsCount - 1;

            if (focusCell) this.props.editor.setCurrentCell(new WSEditorCellCoord<T>(newRowIdx, newColIdx), shift_key);
            e.preventDefault();
            if (newColIdx === 0 && this.props.editor.scrollableRef.current && this.props.editor.scrollableRef.current.scrollLeft !== 0) {
                const el = this.props.editor.scrollableRef.current;
                el.scrollTo(0, el.scrollTop);
            }
        }
        else if (cellEditor) {
            if (e.key !== "Control" && e.key !== "Shift" && e.key !== "Alt" && e.key !== "Meta")
                cellEditor.handleKeyDown(this, viewCell, e);
        }
    }

    handleKeydown = (e: React.KeyboardEvent<HTMLDivElement>, viewCell: WSEditorViewCellCoord<T>) => {
        const cellEditor = this.props.editor.getCellEditor(viewCell);
        const cellEditorFocused = cellEditor && cellEditor.isFocused();

        if (cellEditorFocused && cellEditor)
            cellEditor.handleKeyDown(this, viewCell, e);
        else
            this.rowHandleKeyDown(e, viewCell);
    }

    handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, viewCell: WSEditorViewCellCoord<T>) => {
        const shift_key = e.getModifierState("Shift");
        const ctrl_key = e.getModifierState("Control");

        const cell = viewCell.getCellCoord(this.props.editor.state.scrollOffset);
        if (!viewCell.equals(this.props.editor.state.focusedViewCell)) {
            this.props.editor.setCurrentCell(
                cell,
                shift_key === true, // endingCell
                ctrl_key === false // clearPrevious
            );
        }

        if (this.props.editor.props.onCellClicked) this.props.editor.props.onCellClicked(this.props.editor, cell, e);
    }

    renderRow() {
        const res: React.ReactNode[] = [];

        for (let cIdx = 0; cIdx < this.props.editor.props.cols.length; ++cIdx) {
            const col = this.props.editor.props.cols[cIdx];
            const viewCell = new WSEditorViewCellCoord<T>(this.props.viewRowIdx, col.viewColIdx!);

            const cellStyle = Object.assign({}, {
                minWidth: col.minWidth ? col.minWidth : "",
                maxWidth: col.maxWidth ? col.maxWidth : "",
                width: col.width ? col.width : "",
                outline: 0,
            },
                this.props.editor.selectionContains(viewCell) ? this.props.editor.props.selectionStyle!(this.props.editor, viewCell) : {},
                viewCell.equals(this.props.editor.state.focusedViewCell) ?
                    this.props.editor.props.currentCellContainerStyle!(this.props.editor, viewCell) :
                    this.props.editor.props.cellContainerStyleBase!(this.props.editor, viewCell)
            );

            res.push(<Grid
                key={"c" + viewCell.key()} xs item={true}
                tabIndex={0}
                onClick={(e) => this.handleMouseDown(e, viewCell)}
                onKeyDown={(e) => this.handleKeydown(e, viewCell)}
                onWheel={(e) => this.handleMouseWheel(e, viewCell)}
                style={cellStyle}
                ref={(r) => {
                    this.props.editor.setViewCellRef(viewCell, r);
                }}>
                {
                    col.editor ?
                        col.editor(
                            {
                                data: this.props.editor.getCellData(viewCell),
                                cellContainerStyle: col.cellContainerStyle,
                                cellControlStyle: col.cellControlStyle
                            },
                            this.props.editor,
                            viewCell).render() :
                        new WSEditorCellEditor(
                            { data: this.props.editor.getCellData(viewCell) },
                            this.props.editor,
                            viewCell).render()
                }
            </Grid >);
        }

        return res;
    }

    render() {
        return this.renderRow()
    }
}

export default WSEditorRow;