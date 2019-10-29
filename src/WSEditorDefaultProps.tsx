import { WSEditorSelectMode } from "./WSEditorSelection";
import { CSSProperties } from "@material-ui/styles";

export interface WSEditorPropsOpts {
    viewRowCount?: number;
    viewRowCountFixed?: boolean;
    selectionMode?: WSEditorSelectMode;
    selectionModeMulti?: boolean;
    readonly?: boolean;
    headerBorderStyle?: string;
    currentCellContainerStyle?: CSSProperties;
    selectionBackground?: CSSProperties;
    hideSlider?: boolean;
    cellMargin?: string | number;
    sliderWheelDivisionStep?: number;
    cellContainerStyleBase?: CSSProperties;
    cellContainerStyle?: CSSProperties;
    cellControlStyle?: CSSProperties;
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
    headerBorderStyle: "1px solid #aeaeae",
    currentCellContainerStyle: { border: "1px solid rgba(56,90,162,0.8)" },
    cellContainerStyleBase: { border: "1px solid #eeeeee" },
    cellContainerStyle: {},
    cellControlStyle: {},
    selectionBackground: { background: "rgba(56,90,162,0.2)" },
    hideSlider: false,
    cellMargin: 2,
    sliderWheelDivisionStep: 15,
    debug: false,
    width: "100%"
};