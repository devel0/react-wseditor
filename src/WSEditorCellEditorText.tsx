import * as React from "react";
import WSEditorCellEditor from "./WSEditorCellEditor";
import WSEditorRow from "./WSEditorRow";
import { withStyles, InputBase, makeStyles } from "@material-ui/core";
import WSEditorViewCellCoord from "./WSEditorViewCellCoord";
import { fontFamily } from "@material-ui/system";
import { CSSProperties } from "@material-ui/styles";

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
        const col = this.getCol();        

        const containerStyle = Object.assign({},
            this.editor.props.cellContainerStyle!(this.editor, this.viewCell),
            col.cellContainerStyle ? this.getCol().cellContainerStyle!(this.editor, this.viewCell) : {});
        const controlStyle = Object.assign({},
            { verticalAlign: "middle", border: 0, background: "transparent", outline: 0, padding: 0 },
            this.editor.props.cellControlStyle!(this.editor, this.viewCell),
            col.cellControlStyle ? this.getCol().cellControlStyle!(this.editor, this.viewCell) : {});            

        return <div style={containerStyle}>
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

export default WSEditorCellEditorText;