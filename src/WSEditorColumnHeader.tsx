import * as React from "react";
import WSEditorColumn, { SortDirection } from "./WSEditorColumn";
import WSEditor from "./WSEditor";
import { Grid, Typography } from "@material-ui/core";
import { FaSortUp, FaSortDown } from "react-icons/fa";

export interface WSEditorColumnHeaderProps<T> {
    editor: WSEditor<T>
    col: WSEditorColumn<T>;
    cIdx: number;
}

class WSEditorColumnHeader<T> extends React.Component<WSEditorColumnHeaderProps<T>>
{
    viewRowIdx: number = 0;

    // constructor(props: WSEditorColumnHeaderProps<T>) {
    //     super(props);
    // }

    toggleSort(shiftPressed: boolean) {
        this.props.editor.toggleColumnHeaderSort(this, shiftPressed);
    }

    render() {
        const style = Object.assign({},
            {
                minWidth: this.props.col.minWidth ? this.props.col.minWidth : "",
                maxWidth: this.props.col.maxWidth ? this.props.col.maxWidth : "",
                width: this.props.col.width ? this.props.col.width : "",
            },
            this.props.editor.props.headerCellStyle!(this.props)
        );

        return <Grid
            xs
            onMouseDown={(e) => this.toggleSort(e.getModifierState("Shift"))}
            item={true}
            style={style}>
            <Typography style={{ margin: 2 }}>
                <b>{this.props.col.header}</b>
                {this.props.col.sortDir === SortDirection.Ascending ? <FaSortUp /> :
                    (this.props.col.sortDir === SortDirection.Descending ? <FaSortDown /> : null)}
            </Typography>
        </Grid >
    }
}

export default WSEditorColumnHeader;