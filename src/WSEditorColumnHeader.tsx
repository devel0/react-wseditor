import * as React from "react";
import WSEditorColumn, { SortDirection } from "./WSEditorColumn";
import WSEditor from "./WSEditor";
import { Grid, Typography } from "@material-ui/core";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import WSEditorViewCellCoord from "./WSEditorViewCellCoord";
import WSEditorProps from "./WSEditorProps";
import { CSSProperties } from "@material-ui/styles";
import WSEditorDefaultProps from "./WSEditorDefaultProps";

export interface WSEditorColumnHeaderProps<T> {
    editor: WSEditor<T>;
    // containerStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => CSSProperties;
    // controlStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => CSSProperties;
    // headerCellStyle?: (props: WSEditorColumnHeaderProps<T>) => CSSProperties;
    col: WSEditorColumn<T>;
    cIdx: number;
}

class WSEditorColumnHeader<T> extends React.Component<WSEditorColumnHeaderProps<T>>
{
    viewRowIdx: number = -1;

    // constructor(props: WSEditorColumnHeaderProps<T>) {
    //     super(props);
    // }

    toggleSort(shiftPressed: boolean) {
        this.props.editor.toggleColumnHeaderSort(this, shiftPressed);
    }

    render() {
        const col = this.props.col;
        const viewCell = new WSEditorViewCellCoord<T>(-1, this.props.cIdx);

        const defaultHeaderCellStyle = WSEditor.defaultProps.headerCellStyle!(this.props, {});
        const defaultContainerStyle = WSEditor.defaultProps.cellContainerStyle!(this.props.editor, viewCell, {});
        const containerStyle = Object.assign({},
            this.props.editor.props.cellContainerStyle ? this.props.editor.props.cellContainerStyle!(this.props.editor, viewCell, defaultContainerStyle) : {},
            col.cellContainerStyle ? col.cellContainerStyle!(this.props.editor, viewCell, defaultContainerStyle) : {},
            {
                minWidth: this.props.col.minWidth ? this.props.col.minWidth : "",
                maxWidth: this.props.col.maxWidth ? this.props.col.maxWidth : "",
                width: this.props.col.width ? this.props.col.width : "",
            },
            defaultHeaderCellStyle,
            this.props.editor.props.headerCellStyle ? this.props.editor.props.headerCellStyle!(this.props, defaultContainerStyle) : {},
        );

        const defaultControlStyle = WSEditor.defaultProps.cellControlStyle!(this.props.editor, viewCell, {});
        const controlStyle = Object.assign({},
            this.props.editor.props.cellControlStyle ? this.props.editor.props.cellControlStyle!(this.props.editor, viewCell, defaultControlStyle) : {},
            col.cellControlStyle ? col.cellControlStyle!(this.props.editor, viewCell, defaultControlStyle) : {});

        return <Grid
            xs
            onMouseDown={(e) => this.toggleSort(e.getModifierState("Shift"))}
            item={true}
            style={containerStyle}>
            <Typography style={controlStyle}>
                <b>{this.props.col.header}</b>
                {this.props.col.sortDir === SortDirection.Ascending ? <FaSortUp /> :
                    (this.props.col.sortDir === SortDirection.Descending ? <FaSortDown /> : null)}
            </Typography>
        </Grid >
    }
}

export default WSEditorColumnHeader;