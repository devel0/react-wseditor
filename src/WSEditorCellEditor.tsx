import { WSEditor, WSEditorCellEditorProps, WSEditorViewCellCoord, WSEditorCellEditorDefaultProps } from "./WSEditor";
import * as React from "react";
import { WSEditorRow } from "./WSEditorRow";
import { Grid } from "@material-ui/core";

export class WSEditorCellEditor<T> extends React.Component<WSEditorCellEditorProps<T>>
{
    editor: WSEditor<T>;
    viewCell: WSEditorViewCellCoord<T>;
    customControlRender?: (cellEditor: WSEditorCellEditor<T>, row: T) => JSX.Element;

    static defaultProps = WSEditorCellEditorDefaultProps();

    constructor(props: WSEditorCellEditorProps<T>, editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>,
        customRender?: (cellEditor: WSEditorCellEditor<T>, row: T) => JSX.Element) {
        super(props);

        this.editor = editor;
        this.viewCell = viewCell;
        this.customControlRender = customRender;
        this.editor.setCellEditor(viewCell, this);        
    }

    componentDidUpdate() {

    }

    handleKeyDown(rowEditor: WSEditorRow<T>, viewCell: WSEditorViewCellCoord<T>, e: React.KeyboardEvent<HTMLDivElement>) {        
        if (!this.getIsFocused()) {            
            this.setDirectEditing(true);
        }
    }

    focus() {        
    }

    getIsFocused() { return false; }

    setDirectEditing(isDirect: boolean) {
        this.editor.setDirectEditingCell(this.viewCell);
    }

    isDirectEditing() {
        return this.editor.state.directEditingViewCell.equals(this.viewCell);
    }

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
            { cursor: "default" });

        return <div style={containerStyle}>
            {this.customControlRender ?
                this.customControlRender(this, this.viewCell.getRow(this.editor)) :
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
            onMouseDown={(e) => this.onMousedown(e)}>
            {this.cellContentRender()}
        </Grid>
    }
}