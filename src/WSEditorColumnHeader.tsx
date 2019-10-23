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
    viewRowIdx: number;    

    constructor(props: WSEditorColumnHeaderProps<T>) {
        super(props);
    }

    toggleSort(shiftPressed: boolean) {
        this.props.editor.toggleColumnHeaderSort(this, shiftPressed);
    }

    render() {
        return <Grid
            xs            
            onMouseDown={(e) => this.toggleSort(e.getModifierState("Shift"))}
            item={true} style={{ background: "#eeeeee", cursor: "pointer", border: "1px solid #aeaeae" }}>
            <Typography style={{ margin: 2 }}>
                <b>{this.props.col.header}</b>
                {this.props.col.sortDir === SortDirection.Ascending ? <FaSortUp /> :
                    (this.props.col.sortDir === SortDirection.Descending ? <FaSortDown /> : null)}
            </Typography>
        </Grid>
    }
}

export default WSEditorColumnHeader;