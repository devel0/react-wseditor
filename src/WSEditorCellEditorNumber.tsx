import { WSEditorCellEditorText } from "./WSEditorCellEditorText";
import { stringIsValidNumber } from "./Utils";
import * as React from "react";
import { WSEditor } from "./WSEditor";
import { InputBase, withStyles } from "@material-ui/core";

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

