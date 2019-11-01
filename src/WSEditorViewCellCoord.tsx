import { WSEditor } from "./WSEditor";

import { WSEditorCellCoord } from "./WSEditorCellCoord";

export class WSEditorViewCellCoord<T> {
    private _viewRowIdx: number;
    private _viewColIdx: number;

    constructor(viewRowIdx: number, viewColIdx: number) {
        this._viewRowIdx = viewRowIdx;
        this._viewColIdx = viewColIdx;
    }

    get viewRowIdx() { return this._viewRowIdx; }
    get viewColIdx() { return this._viewColIdx; }

    getCol(editor: WSEditor<T>) { return editor.props.cols[this._viewColIdx]; }
    getRow(editor: WSEditor<T>) { return editor.props.rows[this.getCellCoord(editor.state.scrollOffset).rowIdx]; }

    getCellCoord = (scrollOffset: number) => new WSEditorCellCoord<T>(scrollOffset + this._viewRowIdx, this._viewColIdx);

    key = () => this._viewRowIdx + "_" + this._viewColIdx;

    lessThan(other: WSEditorViewCellCoord<T>) {
        return this.viewRowIdx < other.viewRowIdx || (this.viewRowIdx === other.viewRowIdx && this.viewColIdx < other.viewColIdx);
    }

    greatThan(other: WSEditorViewCellCoord<T>) {
        return this.viewRowIdx > other.viewRowIdx || (this.viewRowIdx === other.viewRowIdx && this.viewColIdx > other.viewColIdx);
    }

    equals(other: WSEditorViewCellCoord<T>) {
        return this.viewRowIdx === other.viewRowIdx && this.viewColIdx === other.viewColIdx;
    }

    toString() {
        return this.key();
    }
}
