import { WSEditorSelectMode } from "./Utils";

import { WSEditor } from "./WSEditor";

import { WSEditorViewCellCoord } from "./WSEditorViewCellCoord";

import { WSEditorColumnHeaderProps } from "./WSEditorColumnHeaderProps";

export interface WSEditorPropsOpts<T> {
    viewRowCount?: number;    
    selectionMode?: WSEditorSelectMode;
    selectionModeMulti?: boolean;
    readonly?: boolean;
    hideSlider?: boolean;
    //cellMargin?: string | number;
    sliderWheelDivisionStep?: number;
    debug?: boolean;
    width?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
    gridCellStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    gridCellFocusedStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    gridRowFocusedStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    selectionStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    cellContainerHoverStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    cellContainerStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    cellControlStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    headerCellStyle?: (props: WSEditorColumnHeaderProps<T>) => React.CSSProperties;
    headerControlStyle?: (props: WSEditorColumnHeaderProps<T>) => React.CSSProperties;
    tableStyle?: () => React.CSSProperties;
    frameStyle?: () => React.CSSProperties;
}