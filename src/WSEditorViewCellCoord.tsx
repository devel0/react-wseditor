import WSEditorCellCoord from "./WSEditorCellCoord";
import WSEditor from "./WSEditor";

class WSEditorViewCellCoord<T> {
    private _viewRowIdx: number;
    private _viewColIdx: number;

    constructor(viewRowIdx: number, viewColIdx: number) {
        this._viewRowIdx = viewRowIdx;
        this._viewColIdx = viewColIdx;
    }

    get viewRowIdx() { return this._viewRowIdx; }
    get viewColIdx() { return this._viewColIdx; }

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

    getRow = (editor: WSEditor<T>) => editor.props.rows[this.getCellCoord(editor.state.scrollOffset).rowIdx];    

    toString() {
        return this.key();
    }
}

export default WSEditorViewCellCoord;