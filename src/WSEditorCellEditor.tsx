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
    customRender?: (cellEditor: WSEditorCellEditor<T, S>) => JSX.Element;
    private directEditing: boolean = true;

    constructor(props: WSEditorCellEditorProps<T>, editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>,
        customRender?: (cellEditor: WSEditorCellEditor<T, S>) => JSX.Element) {
        super(props);

        this.editor = editor;
        this.viewCell = viewCell;
        this.customRender = customRender;
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
        if (this.customRender)
            return this.customRender(this);
        else
            return <Typography style={{ lineHeight: this.editor.props.cellLineHeight! }}>{this.props.data}</Typography>
    }

    onMousedown(e: React.MouseEvent<HTMLDivElement>) {
        if (!this.editor.state.focusedViewCell.equals(this.viewCell)) e.preventDefault();
    }

    render() {
        return <Grid item={true}
            style={{ margin: this.editor.props.cellMargin }}
            onMouseDown={(e) => this.onMousedown(e)}>
            {this.cellContentRender()}
        </Grid>
    }
}

export default WSEditorCellEditor;