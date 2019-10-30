import WSEditor from "./WSEditor";
import WSEditorCellCoord from "./WSEditorCellCoord";
import WSEditorViewCellCoord from "./WSEditorViewCellCoord";

export enum WSEditorSelectMode {
    Cell,
    Row
}

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

export default class WSEditorSelection<T> {

    private editor: WSEditor<T>;
    private _ranges: WSEditorSelectionRange<T>[];

    constructor(editor: WSEditor<T>, ranges: WSEditorSelectionRange<T>[]) {
        this.editor = editor;
        this._ranges = ranges;
    }

    get ranges() { return this._ranges; }

    get bounds() {
        if (this._ranges.length === 0)
            return null;
        else {
            let res = this._ranges[0].bounds;
            for (let i = 1; i < this._ranges.length; ++i) {
                const b = this._ranges[i].bounds;
                res = res.union(b);
            }
            return res;
        }
    }

    /** return copy of this */
    dup(): WSEditorSelection<T> {
        return new WSEditorSelection<T>(this.editor, this._ranges.map((r) => r.dup()));
    }

    add(cell: WSEditorCellCoord<T>) {
        const res = this.dup();

        res.ranges.push(new WSEditorSelectionRange(cell, cell));

        return res;
    }

    /** create a copy of this with last range extends to given cell */
    extendsTo(cell: WSEditorCellCoord<T>) {
        const res = this.dup();

        const lastrng = res.ranges[res.ranges.length - 1];
        res.ranges.splice(res.ranges.length - 1, 1);

        const newRng = new WSEditorSelectionRange(lastrng.from, cell);
        res.ranges.push(newRng);

        return res;
    }

    setSelection(range: WSEditorSelectionRange<T>) {
        this._ranges = [range];
    }

    /** if row mode selection extends automatically to entire row containing selected cells */
    containsViewcell(viewCell: WSEditorViewCellCoord<T>): boolean {
        const cell = viewCell.getCellCoord(this.editor.state.scrollOffset);

        return this._ranges.find((w) => w.contains(cell, this.editor.props.selectionMode === WSEditorSelectMode.Row)) !== undefined;
    }

    *cells() {
        for (let rngIdx = 0; rngIdx < this._ranges.length; ++rngIdx) {
            const rng = this._ranges[rngIdx];
            let rngCells = rng.cells();
            let cell = rngCells.next();
            while (!cell.done) {
                yield cell.value;
                cell = rngCells.next();
            }
        }
    }

    rowIdxs() {
        let res: Set<number> = new Set<number>();

        for (let rngIdx = 0; rngIdx < this._ranges.length; ++rngIdx) {
            const rng = this._ranges[rngIdx];
            let rngCells = rng.cells();
            let cell = rngCells.next();
            while (!cell.done) {
                res.add(cell.value.rowIdx);
                cell = rngCells.next();
            }
        }

        return res;
    }

    toString() {
        let str = "";
        for (let i = 0; i < this.ranges.length; ++i) {
            if (i > 0) str += " ; "
            str += this.ranges[i].toString();
        }

        return str;
    }

}