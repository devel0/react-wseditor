import * as React from "react";
import WSEditor from "./WSEditor";
import WSEditorCellEditor, { WSEditorCellEditorProps } from "./WSEditorCellEditor";
import WSEditorRow from "./WSEditorRow";
import { Checkbox } from "@material-ui/core";
import * as icons from '@material-ui/icons';
import WSEditorViewCellCoord from "./WSEditorViewCellCoord";

class WSEditorCellEditorBoolean<T> extends WSEditorCellEditor<T>
{
    cbRef: HTMLButtonElement | null = null;

    constructor(props: WSEditorCellEditorProps<T>, editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) {
        super(props, editor, viewCell);
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
        return <div style={{ textAlign: "center" }}>
            <Checkbox
                style={{ width: 10, height: 10, padding: 0 }}
                icon={<icons.CheckBoxOutlineBlank style={{ fontSize: 20 }} />}
                checkedIcon={<icons.CheckBox style={{ fontSize: 20 }} />}
                ref={(h: HTMLButtonElement) => this.cbRef = h}
                checked={this.props.data}
                onChange={(e) => { this.setData(e.target.checked) }}
            />
        </div>
    }
}

export default WSEditorCellEditorBoolean;