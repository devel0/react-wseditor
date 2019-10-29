import * as React from "react";
import WSEditor from "./WSEditor";
import WSEditorCellEditor, { WSEditorCellEditorProps } from "./WSEditorCellEditor";
import WSEditorRow from "./WSEditorRow";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import * as icons from '@material-ui/icons';
import WSEditorViewCellCoord from "./WSEditorViewCellCoord";
import { TextAlignProperty } from "csstype";

export interface WSEditorCellEditorBooleanOpts {
    label?: React.ReactNode;
    labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
    textAlign?: TextAlignProperty;
}

class WSEditorCellEditorBoolean<T> extends WSEditorCellEditor<T>
{
    cbRef: HTMLButtonElement | null = null;
    opts?: WSEditorCellEditorBooleanOpts;

    constructor(props: WSEditorCellEditorProps<T>, editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>,
        opts?: WSEditorCellEditorBooleanOpts) {
        super(props, editor, viewCell);
        this.opts = opts;
    }

    isFocused() {
        return false;
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

    cellContentRender() {
        if (this.editor.props.readonly === true || this.editor.props.cols[this.viewCell.viewColIdx].readonly === true) {
            return <div style={{ ...this.editor.props.cellContainerStyle, ...this.getCol().cellContainerStyle }}>
                {this.props.data === true ? <icons.Done style={{ ...this.getCol().cellControlStyle }} /> : this.props.data !== false ? "-" : ""}
            </div>
        }
        else {
            const ctl = <Checkbox
                style={{ width: 10, height: 10, padding: 0 }}
                icon={<icons.CheckBoxOutlineBlank style={{ fontSize: 20 }} />}
                checkedIcon={<icons.CheckBox style={{ fontSize: 20 }} />}
                ref={(h: HTMLButtonElement) => this.cbRef = h}
                checked={this.props.data}
                onChange={(e) => { this.setData(e.target.checked) }}
            />;
            return <div style={{ ...this.editor.props.cellContainerStyle, ...this.getCol().cellContainerStyle }}>
                <div style={{ textAlign: (this.opts && this.opts.textAlign) ? this.opts.textAlign : "left", ...this.props.cellControlStyle }}>
                    {(this.opts && this.opts.label) ?
                        <FormControlLabel
                            control={ctl}
                            labelPlacement={this.opts.labelPlacement}
                            label={this.opts.label} />
                        :
                        ctl}
                </div>
            </div>
        }
    }
}

export default WSEditorCellEditorBoolean;