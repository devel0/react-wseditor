import { WSEditor, WSEditorSelectMode, WSEditorViewCellCoord, WSEditorColumnHeaderProps } from "./WSEditor";

export interface WSEditorPropsOpts<T> {
    viewRowCount?: number;
    viewRowCountFixed?: boolean;
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
    frameStyle?: React.CSSProperties;
}