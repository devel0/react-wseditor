import { WSEditor } from "./WSEditor";

import { WSEditorSelectionRange } from "./WSEditorSelectionRange";

import { WSEditorCellCoord } from "./WSEditorCellCoord";

import { WSEditorViewCellCoord } from "./WSEditorViewCellCoord";

import { WSEditorSelectMode } from "./Utils";

export class WSEditorSelection<T> {

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