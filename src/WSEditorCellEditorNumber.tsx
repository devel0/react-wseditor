import * as React from "react";
import WSEditorCellEditorText from "./WSEditorCellEditorText";
import { stringIsValidNumber } from "./Utils";
import { withStyles } from "@material-ui/styles";
import { InputBase } from "@material-ui/core";
import WSEditor from "./WSEditor";

const CellTextField = withStyles({
    root: {
        '& input': {
            cursor: "default",
            textAlign: 'right',
            padding: 0
        },
    },
    error: {
        color: 'red'
    }
})(InputBase);

class WSEditorCellEditorNumber<T> extends WSEditorCellEditorText<T>
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

        const defaultContainerStyle = WSEditor.defaultProps.cellContainerStyle!(this.editor, this.viewCell, {});
        const containerStyle = Object.assign({},
            this.editor.props.cellContainerStyle ? this.editor.props.cellContainerStyle!(this.editor, this.viewCell, defaultContainerStyle) : {},
            col.cellContainerStyle ? col.cellContainerStyle!(this.editor, this.viewCell, defaultContainerStyle) : {}
        );

        const defaultControlStyle = WSEditor.defaultProps.cellControlStyle!(this.editor, this.viewCell, {});
        const controlStyle = Object.assign({},
            this.editor.props.cellControlStyle ? this.editor.props.cellControlStyle!(this.editor, this.viewCell, defaultControlStyle) : {},
            col.cellControlStyle ? col.cellControlStyle!(this.editor, this.viewCell, defaultControlStyle) : {});

        return <div style={containerStyle}>
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

export default WSEditorCellEditorNumber;