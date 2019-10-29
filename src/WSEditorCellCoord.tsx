import WSEditorViewCellCoord from "./WSEditorViewCellCoord";
import WSEditor from "./WSEditor";

class WSEditorCellCoord<T> {
    private _rowIdx: number;
    private _colIdx: number;

    constructor(rowIdx: number, colIdx: number) {
        this._rowIdx = rowIdx;
        this._colIdx = colIdx;
    }

    get rowIdx() { return this._rowIdx; }
    get colIdx() { return this._colIdx; }

    getCol(editor: WSEditor<T>) { return editor.props.cols[this._colIdx]; }
    getRow(editor: WSEditor<T>) { return editor.props.rows[this._rowIdx]; }

    getViewCellCoord = (scrollOffset: number) => new WSEditorViewCellCoord<T>(this._rowIdx - scrollOffset, this._colIdx);

    key = () => this._rowIdx + "_" + this._colIdx;

    lessThan(other: WSEditorCellCoord<T>) {
        return this.rowIdx < other.rowIdx || (this.rowIdx === other.rowIdx && this.colIdx < other.colIdx);
    }

    greatThan(other: WSEditorCellCoord<T>) {
        return this.rowIdx > other.rowIdx || (this.rowIdx === other.rowIdx && this.colIdx > other.colIdx);
    }

    equals(other: WSEditorCellCoord<T>) {
        return this.rowIdx === other.rowIdx && this.colIdx === other.colIdx;
    }

    toString() { return this._rowIdx + ":" + this._colIdx; }
}

export default WSEditorCellCoord;