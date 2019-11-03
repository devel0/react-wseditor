import * as React from "react";
import { Grid, Typography } from "@material-ui/core";
import * as icons from '@material-ui/icons';
import { WSEditorColumnHeaderProps } from "./WSEditorColumnHeaderProps";
import { WSEditorColumnHeaderState } from "./WSEditorColumnHeaderState";
import { WSEditorViewCellCoord } from "./WSEditorViewCellCoord";
import { WSEditor } from "./WSEditor";
import { SortDirection } from "./Utils";

export class WSEditorColumnHeader<T> extends React.Component<WSEditorColumnHeaderProps<T>, WSEditorColumnHeaderState>
{
    viewRowIdx: number = -1;
    containerRef: React.RefObject<HTMLDivElement>;

    constructor(props: WSEditorColumnHeaderProps<T>) {
        super(props);

        this.state = {
            currentWidth: 0
        };
        this.containerRef = React.createRef();
    }

    toggleSort(shiftPressed: boolean) {
        this.props.editor.toggleColumnHeaderSort(this, shiftPressed);
    }

    componentDidUpdate() {
        if (this.containerRef && this.containerRef.current) {
            const w = this.containerRef.current.clientWidth;
            if (this.props.editor.state.columnWidths[this.props.cIdx] !== w) {  
                this.props.editor.setColumnWidth(this.props.cIdx, w);
            }            
        }
    }

    render() {
        if (this.containerRef && this.containerRef.current) {            
            const w = this.containerRef.current.clientWidth;
            if (w > 0 && w !== this.props.editor.state.columnWidths[this.props.cIdx]) {
                this.props.editor.setColumnWidth(this.props.cIdx, w);
            }
        }

        if (this.containerRef && this.containerRef.current) {
            const colCurrentWidth = this.containerRef.current.clientWidth;
            if (colCurrentWidth > 0 && colCurrentWidth !== this.state.currentWidth) {
                this.setState({ currentWidth: colCurrentWidth });
            }
        }

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
            key={"c:"+ this.props.cIdx}
            onMouseDown={(e) => { this.toggleSort(e.getModifierState("Shift")); e.preventDefault(); }}
            item={true}
            ref={this.containerRef}
            style={containerStyle} >
            <Grid container direction="row">
                <Grid item={true} xs>
                    <Typography style={controlStyle}>
                        <b>{this.props.col.header}</b>
                    </Typography>
                </Grid>
                <Grid item={true} xs="auto">
                    <Typography style={controlStyle}>
                        {this.props.col.sortDir === SortDirection.Ascending ? <icons.ArrowUpward fontSize="small" /> :
                            (this.props.col.sortDir === SortDirection.Descending ? <icons.ArrowDownward fontSize="small" /> : null)}
                    </Typography>
                </Grid>
            </Grid>
        </Grid >
    }
}
