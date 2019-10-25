import WSEditorColumn from "./WSEditorColumn";
import { WSEditorSelectMode } from "./WSEditorSelection";

export interface WSEditorPropsOpts {
    viewRowCount?: number;
    selectionMode?: WSEditorSelectMode;
    selectionModeMulti?: boolean;
    outlineCell?: boolean;
    outlineCellStyle?: string;
    readonly?: boolean;
    cellBorder?: boolean;
    cellBorderStyle?: string;
    currentCellBorderStyle?: string;
    selectionBackground?: string;
    hideSlider?: boolean;
    filter?: string;    
    cellMargin?: string | number;
    sliderWheelDivisionStep?: number;
    cellLineHeight?: string | number;
}

export const WSEditorDefaultProps: WSEditorPropsOpts = {
    viewRowCount: 10,
    selectionMode: WSEditorSelectMode.Cell,
    selectionModeMulti: true,
    readonly: false,
    outlineCell: false,
    outlineCellStyle: "2px solid rgba(56,90,162,0.8)",
    cellBorder: true,
    cellBorderStyle: "1px solid #eeeeee",
    currentCellBorderStyle: "1px solid rgba(56,90,162,0.8)",
    selectionBackground: "rgba(56,90,162,0.2)",
    hideSlider: false,
    filter: undefined,    
    cellMargin: 2,
    sliderWheelDivisionStep: 15,
    cellLineHeight: 1,
};