import { WSEditorCellCoord } from "./WSEditorCellCoord";

import { WSEditorSelectionBounds } from "./WSEditorSelectionBounds";

export class WSEditorSelectionRange<T>
{
    private _from: WSEditorCellCoord<T>;
    private _to: WSEditorCellCoord<T>;

    get from() { return this._from; }
    get to() { return this._to; }

    /** compute this range bounds */
    get bounds(): WSEditorSelectionBounds<T> { return new WSEditorSelectionBounds<T>(this); }

    constructor(from: WSEditorCellCoord<T>, to: WSEditorCellCoord<T>) {
        this._from = from;
        this._to = to;
    }

    /** returns copy of this */
    dup() {
        return new WSEditorSelectionRange<T>(this.from, this.to);
    }

    contains(other: WSEditorCellCoord<T>, rowMode: boolean = false) {
        if (rowMode === true) {
            let minRow = this._from.rowIdx;
            let maxRow = this._to.rowIdx;
            if (maxRow < minRow) {
                let x = minRow;
                minRow = maxRow;
                maxRow = x;
            }
            return minRow <= other.rowIdx && other.rowIdx <= maxRow;
        }
        else
            return this.bounds.contains(other);
    }

    toString() {
        if (this._from.equals(this._to))
            return "(" + this._from.toString() + ")";
        else
            return "(" + this.from.toString() + ")-(" + this.to.toString() + ")";
    }

    *cells() {
        const bound = this.bounds;

        for (let ri = bound.minRowIdx; ri <= bound.maxRowIdx; ++ri) {
            for (let ci = bound.minColIdx; ci <= bound.maxColIdx; ++ci) {
                yield new WSEditorCellCoord<T>(ri, ci);
            }
        }
    }
}
