import * as React from "react";
import WSEditor from "./WSEditor";
import WSEditorRow from "./WSEditorRow";
import { Grid } from "@material-ui/core";
import WSEditorViewCellCoord from "./WSEditorViewCellCoord";
import { CSSProperties } from "@material-ui/styles";
import WSEditorDefaultProps from "./WSEditorDefaultProps";

export interface WSEditorCellEditorProps<T> {
    data: any;
    cellContainerStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>, defaultStyle: CSSProperties) => CSSProperties;
    cellControlStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>, defaultStyle: CSSProperties) => CSSProperties;
}

class WSEditorCellEditor<T, S = {}> extends React.Component<WSEditorCellEditorProps<T>, S>
{
    editor: WSEditor<T>;
    viewCell: WSEditorViewCellCoord<T>;
    customControlRender?: (cellEditor: WSEditorCellEditor<T, S>) => JSX.Element;
    private directEditing: boolean = true;

    constructor(props: WSEditorCellEditorProps<T>, editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>,
        customRender?: (cellEditor: WSEditorCellEditor<T, S>) => JSX.Element) {
        super(props);

        this.editor = editor;
        this.viewCell = viewCell;
        this.customControlRender = customRender;
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

    getRow = () => this.viewCell.getRow
    getCol = () => this.editor.props.cols[this.viewCell.viewColIdx];

    leaveCellEdit() {
        this.editor.leaveCellEdit(this.viewCell);
        this.setDirectEditing(true);
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
            col.cellControlStyle ? col.cellControlStyle!(this.editor, this.viewCell, defaultControlStyle) : {},
            { cursor: "default" });

        return <div style={containerStyle}>
            {this.customControlRender ?
                this.customControlRender(this) :
                <div style={controlStyle}>
                    {this.props.data}
                </div>
            }
        </div>
    }

    onMousedown(e: React.MouseEvent<HTMLDivElement>) {
        if (!this.editor.state.focusedViewCell.equals(this.viewCell)) e.preventDefault();
    }

    render() {

        return <Grid item={true}
            style={{ margin: this.editor.props.cellMargin, }}
            onMouseDown={(e) => this.onMousedown(e)}>
            {this.cellContentRender()}
        </Grid>
    }
}

export default WSEditorCellEditor;