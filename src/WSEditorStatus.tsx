import { WSEditorSelection, WSEditorViewCellCoord } from "./WSEditor";

export interface WSEditorStatus<T> {
    scrollOffset: number;
    focusedViewCell: WSEditorViewCellCoord<T>;
    directEditingViewCell: WSEditorViewCellCoord<T>;
    hoverViewRowIdx: number;
    headerRowHeight: number;
    gridHeight: number;
    selection: WSEditorSelection<T>;
}