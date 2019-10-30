import * as React from "react";
import WSEditorColumn, { SortDirection } from "./WSEditorColumn";
import WSEditor from "./WSEditor";
import { Grid, Typography } from "@material-ui/core";
import WSEditorViewCellCoord from "./WSEditorViewCellCoord";
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';

export interface WSEditorColumnHeaderProps<T> {
    editor: WSEditor<T>;
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

        const defaultHeaderCellStyle = WSEditor.defaultProps.headerCellStyle!(this.props);
        const defaultContainerStyle = WSEditor.defaultProps.cellContainerStyle!(this.props.editor, viewCell);
        const containerStyle = Object.assign({},
            defaultContainerStyle,
            this.props.editor.props.cellContainerStyle ? this.props.editor.props.cellContainerStyle!(this.props.editor, viewCell) : {},
            col.cellContainerStyle ? col.cellContainerStyle!(this.props.editor, viewCell) : {},            
            defaultHeaderCellStyle,
            {
                minWidth: this.props.col.minWidth ? this.props.col.minWidth : "",
                maxWidth: this.props.col.maxWidth ? this.props.col.maxWidth : "",
                width: this.props.col.width ? this.props.col.width : "",
            },
            this.props.editor.props.headerCellStyle ? this.props.editor.props.headerCellStyle!(this.props) : {},
        );

        const defaultHeaderControlStyle = WSEditor.defaultProps.headerControlStyle!(this.props);        
        const controlStyle = Object.assign({},            
            defaultHeaderControlStyle,
            this.props.editor.props.headerControlStyle ? this.props.editor.props.headerControlStyle!(this.props) : {});

        return <Grid
            xs
            onMouseDown={(e) => { this.toggleSort(e.getModifierState("Shift")); e.preventDefault(); }}
            item={true}
            style={containerStyle} >
            <Grid container direction="row">
                <Grid item={true} xs>
                    <Typography style={controlStyle}>
                        <b>{this.props.col.header}</b>
                    </Typography>
                </Grid>
                <Grid item={true} xs="auto">
                    <Typography style={controlStyle}>
                        {this.props.col.sortDir === SortDirection.Ascending ? <ArrowUpward fontSize="small" /> :
                            (this.props.col.sortDir === SortDirection.Descending ? <ArrowDownward fontSize="small" /> : null)}
                    </Typography>
                </Grid>
            </Grid>
        </Grid >
    }
}

export default WSEditorColumnHeader;