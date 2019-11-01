import { WSEditorSelectionRange, WSEditorCellCoord } from "./WSEditor";

export class WSEditorSelectionBounds<T> {
    private _minRowIdx: number;
    private _minColIdx: number;
    private _maxRowIdx: number;
    private _maxColIdx: number;

    get minRowIdx() { return this._minRowIdx; }
    get minColIdx() { return this._minColIdx; }
    get maxRowIdx() { return this._maxRowIdx; }
    get maxColIdx() { return this._maxColIdx; }

    constructor(rng: WSEditorSelectionRange<T>) {
        this._minRowIdx = rng.from.rowIdx < rng.to.rowIdx ? rng.from.rowIdx : rng.to.rowIdx;
        this._minColIdx = rng.from.colIdx < rng.to.colIdx ? rng.from.colIdx : rng.to.colIdx;
        this._maxRowIdx = rng.from.rowIdx > rng.to.rowIdx ? rng.from.rowIdx : rng.to.rowIdx;
        this._maxColIdx = rng.from.colIdx > rng.to.colIdx ? rng.from.colIdx : rng.to.colIdx;
    }

    /** return new bound that extends this one to given other */
    union(other: WSEditorSelectionBounds<T>) {
        return new WSEditorSelectionBounds<T>(
            new WSEditorSelectionRange<T>(
                new WSEditorCellCoord<T>(
                    this._minRowIdx < other._minRowIdx ? this._minRowIdx : other._minRowIdx,
                    this._minColIdx > other._minColIdx ? this._minColIdx : other._minColIdx),
                new WSEditorCellCoord<T>(
                    this._maxRowIdx > other._maxRowIdx ? this._maxRowIdx : other._maxRowIdx,
                    this._maxColIdx > other._maxColIdx ? this._maxColIdx : other._maxColIdx)));
    }

    contains(cell: WSEditorCellCoord<T>) {
        return cell.rowIdx >= this._minRowIdx && cell.rowIdx <= this._maxRowIdx &&
            cell.colIdx >= this._minColIdx && cell.colIdx <= this._maxColIdx;
    }
}