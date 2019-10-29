import * as React from "react";
import WSEditorCellEditor from "./WSEditorCellEditor";
import WSEditorRow from "./WSEditorRow";
import { withStyles, InputBase } from "@material-ui/core";
import WSEditorViewCellCoord from "./WSEditorViewCellCoord";

const CellTextField = withStyles({
    root: {
        '& input': {
            cursor: "default",
            padding: 0
        },
    },
})(InputBase);

class WSEditorCellEditorText<T> extends WSEditorCellEditor<T>
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
        const containerStyle = Object.assign({}, this.editor.props.cellContainerStyle, this.getCol().cellContainerStyle);
        const controlStyle = Object.assign({}, this.editor.props.cellControlStyle, this.getCol().cellControlStyle, { verticalAlign: "middle" });

        return <div style={containerStyle}>
            <CellTextField
                fullWidth
                style={controlStyle}
                inputRef={(h) => this.txtboxRef = h}
                value={this.props.data}
                onChange={(e) => { this.setData(e.target.value) }} />
        </div>
    }
}

export default WSEditorCellEditorText;