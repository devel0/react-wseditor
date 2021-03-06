import * as React from "react";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import * as icons from '@material-ui/icons';
import { WSEditorCellEditor } from "./WSEditorCellEditor";
import { WSEditorCellEditorBooleanOpts } from "./WSEditorCellEditorBooleanOpts";
import { WSEditorCellEditorProps } from "./WSEditorCellEditorProps";
import { WSEditorViewCellCoord } from "./WSEditorViewCellCoord";
import { WSEditorRow } from "./WSEditorRow";
import { WSEditor } from "./WSEditor";

export class WSEditorCellEditorBoolean<T> extends WSEditorCellEditor<T>
{
    cbRef: HTMLElement | null = null;
    opts?: WSEditorCellEditorBooleanOpts;

    constructor(props: WSEditorCellEditorProps<T>, editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>,
        opts?: WSEditorCellEditorBooleanOpts) {
        super(props, editor, viewCell);
        this.opts = opts;
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

    static nr: number = 0;

    cellContentRender() {
        const col = this.getCol();

        const defaultContainerStyle = WSEditor.defaultProps.cellContainerStyle!(this.editor, this.viewCell);
        const containerStyle = Object.assign({},
            defaultContainerStyle,
            this.editor.props.cellContainerStyle ? this.editor.props.cellContainerStyle!(this.editor, this.viewCell) : {},
            col.cellContainerStyle ? col.cellContainerStyle!(this.editor, this.viewCell) : {}
        );

        const defaultControlStyle = WSEditor.defaultProps.cellControlStyle!(this.editor, this.viewCell);
        if (this.editor.props.readonly === true || this.editor.props.cols[this.viewCell.viewColIdx].readonly === true) {
            const controlStyle = Object.assign({},
                defaultControlStyle,
                this.editor.props.cellControlStyle ? this.editor.props.cellControlStyle!(this.editor, this.viewCell) : {},
                col.cellControlStyle ? col.cellControlStyle!(this.editor, this.viewCell) : {});

            return <div style={containerStyle}>
                {this.props.data === true ? <icons.Done style={controlStyle} /> : this.props.data !== false ? "-" : ""}
            </div>
        }
        else if (this.opts && this.opts.noMaterial === true) {
            const n = WSEditorCellEditorBoolean.nr++;
            const idref = "n" + n;
            const ctl = <input type="checkbox"                
                ref={(x) => this.cbRef = x}
                id={idref} name={idref}
                checked={this.props.data}
                onChange={(e) => { this.setData(e.target.checked) }}
            />;

            const controlStyle = Object.assign({},
                defaultControlStyle,
                this.editor.props.cellControlStyle ? this.editor.props.cellControlStyle!(this.editor, this.viewCell) : {},
                col.cellControlStyle ? col.cellControlStyle!(this.editor, this.viewCell) : {},
            );

            return <div style={controlStyle}>
                {(this.opts && this.opts.label) ?
                    this.opts.labelPlacement === "start" ?
                        <div>
                            <label htmlFor={idref}>{this.opts.label}</label>{ctl}
                        </div>
                        :
                        <div>
                            {ctl}<label htmlFor={idref}>{this.opts.label}</label>
                        </div>
                    :
                    ctl}
            </div>
        } else {
            const ctl = <Checkbox
                
                ref={(h: HTMLButtonElement) => this.cbRef = h}
                checked={this.props.data}
                onChange={(e) => { this.setData(e.target.checked) }}
            />;

            const controlStyle = Object.assign({},
                defaultControlStyle,
                this.editor.props.cellControlStyle ? this.editor.props.cellControlStyle!(this.editor, this.viewCell) : {},
                col.cellControlStyle ? col.cellControlStyle!(this.editor, this.viewCell) : {},
            );

            return <div style={controlStyle}>
                {(this.opts && this.opts.label) ?
                    <FormControlLabel
                        control={ctl}
                        labelPlacement={this.opts.labelPlacement}
                        label={this.opts.label}
                    />
                    :
                    ctl}
            </div>
        }
    }
}
