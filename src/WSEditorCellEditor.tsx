import * as React from "react";
import WSEditorColumn from "./WSEditorColumn";
import WSEditor from "./WSEditor";
import WSEditorRow from "./WSEditorRow";
import { Typography, Grid } from "@material-ui/core";
import WSEditorViewCellCoord from "./WSEditorViewCellCoord";

export interface WSEditorCellEditorProps<T> {
    data: any;
}

class WSEditorCellEditor<T, S = {}> extends React.Component<WSEditorCellEditorProps<T>, S>
{
    editor: WSEditor<T>;
    viewCell: WSEditorViewCellCoord<T>;
    private directEditing: boolean = true;

    constructor(props: WSEditorCellEditorProps<T>, editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) {
        super(props);

        this.editor = editor;
        this.viewCell = viewCell;
        this.editor.setCellEditor(viewCell, this);
    }

    handleKeyDown(rowEditor: WSEditorRow<T>, viewCell: WSEditorViewCellCoord<T>, e: React.KeyboardEvent<HTMLDivElement>) {
    }

    focus() {
    }

    isFocused() {
        return false;
    }

    setDirectEditing(isDirect: boolean) {
        this.directEditing = isDirect;
    }

    isDirectEditing() { return this.directEditing; }

    setData(newData: any) {
        if (this.editor.props.readonly === true || this.getCol().readonly === true) return;
        this.editor.setViewCellData(this.viewCell, newData);
    }

    getCol = () => this.editor.props.cols[this.viewCell.viewColIdx];

    leaveCellEdit() {
        this.editor.leaveCellEdit(this.viewCell);
        this.setDirectEditing(true);
    }

    cellContentRender() {
        return <Typography style={{ lineHeight: 1 }}>{this.props.data}</Typography>
    }

    onMousedown(e: React.MouseEvent<HTMLDivElement>) {
        if (!this.editor.state.focusedViewCell.equals(this.viewCell)) e.preventDefault();
    }

    render() {
        return <Grid item={true}
            style={{ margin: 2 }}
            onMouseDown={(e) => this.onMousedown(e)}>
            {this.cellContentRender()}
        </Grid>
    }
}

export default WSEditorCellEditor;