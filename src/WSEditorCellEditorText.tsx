import { WSEditorRow, WSEditorCellEditor, WSEditorViewCellCoord, WSEditor } from "./WSEditor";
import * as React from "react";
import { InputBase } from "@material-ui/core";

export class WSEditorCellEditorText<T> extends WSEditorCellEditor<T>
{
    txtboxRef: HTMLInputElement | null = null;

    // constructor(props: WSEditorCellEditorProps<T>, editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) {
    //     super(props, editor, viewCell);
    // }

    getIsFocused() {
        return (this.txtboxRef && document.activeElement === this.txtboxRef) || false;
    }

    focus() {
        super.focus();
        if (this.txtboxRef) {
            const strlen = String(this.props.data).length;
            this.txtboxRef.focus();
            this.txtboxRef.setSelectionRange(strlen, strlen);
        }
    }

    handleKeyDown(rowEditor: WSEditorRow<T>, viewCell: WSEditorViewCellCoord<T>, e: React.KeyboardEvent<HTMLDivElement>) {
        const isFocused = this.getIsFocused();

        super.handleKeyDown(rowEditor, viewCell, e);

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
