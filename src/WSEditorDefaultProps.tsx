import WSEditorColumn from "./WSEditorColumn";
import { WSEditorSelectMode } from "./WSEditorSelection";

export interface WSEditorPropsOpts {
    viewRowCount?: number;
    viewRowCountFixed?: boolean;
    selectionMode?: WSEditorSelectMode;
    selectionModeMulti?: boolean;
    outlineCell?: boolean;
    outlineCellStyle?: string;
    readonly?: boolean;
    cellBorder?: boolean;
    cellBorderStyle?: string;
    headerBorderStyle?: string;
    currentCellBorderStyle?: string;
    selectionBackground?: string;
    hideSlider?: boolean;
    cellMargin?: string | number;
    sliderWheelDivisionStep?: number;
    cellLineHeight?: string | number;
    debug?: boolean;
    width?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
}

export const WSEditorDefaultProps: WSEditorPropsOpts = {
    viewRowCount: 10,
    viewRowCountFixed: false,
    selectionMode: WSEditorSelectMode.Cell,
    selectionModeMulti: true,
    readonly: false,
    outlineCell: false,
    outlineCellStyle: "2px solid rgba(56,90,162,0.8)",
    headerBorderStyle: "1px solid #aeaeae",
    cellBorder: true,
    cellBorderStyle: "1px solid #eeeeee",
    currentCellBorderStyle: "1px solid rgba(56,90,162,0.8)",
    selectionBackground: "rgba(56,90,162,0.2)",
    hideSlider: false,
    cellMargin: 2,
    sliderWheelDivisionStep: 15,
    cellLineHeight: 1,
    debug: false,
    width: "100%"
};