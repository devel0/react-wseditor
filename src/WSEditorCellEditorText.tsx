import * as React from "react";
import { InputBase } from "@material-ui/core";
import { WSEditorCellEditor } from "./WSEditorCellEditor";
import { WSEditorRow } from "./WSEditorRow";
import { WSEditorViewCellCoord } from "./WSEditorViewCellCoord";
import { WSEditor } from "./WSEditor";

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

    render() {
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
            { cursor: "default", verticalAlign: "middle", border: 0, background: "transparent", outline: 0, padding: 0 });        

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
