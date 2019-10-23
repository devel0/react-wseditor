import * as React from "react";
import WSEditor from "./WSEditor";
import { WSEditorCellEditorProps } from "./WSEditorCellEditor";
import WSEditorCellEditorText from "./WSEditorCellEditorText";
import { stringIsValidNumber } from "./Utils";
import { withStyles } from "@material-ui/styles";
import { InputBase } from "@material-ui/core";
import WSEditorViewCellCoord from "./WSEditorViewCellCoord";

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
    constructor(props: WSEditorCellEditorProps<T>, editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) {
        super(props, editor, viewCell);
    }

    isValid(newData: any) {
        const str = String(newData);
        return str.length === 0 || stringIsValidNumber(str);
    }

    cellContentRender() {
        return <CellTextField            
            fullWidth
            error={!this.isValid(this.props.data)}
            inputRef={(h) => this.txtboxRef = h}
            value={this.props.data}
            onChange={(e) => { this.setData(e.target.value) }}
        />
    }
}

export default WSEditorCellEditorNumber;