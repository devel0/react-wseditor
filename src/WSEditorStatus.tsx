import { WSEditorViewCellCoord } from "./WSEditorViewCellCoord";

import { WSEditorSelection } from "./WSEditorSelection";

export interface WSEditorStatus<T> {
    scrollOffset: number;
    focusedViewCell: WSEditorViewCellCoord<T>;
    directEditingViewCell: WSEditorViewCellCoord<T>;
    hoverViewRowIdx: number;
    headerRowHeight: number;
    gridHeight: number;
    selection: WSEditorSelection<T>;
}