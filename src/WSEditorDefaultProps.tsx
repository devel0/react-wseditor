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

    selectionBackground?: string;
}

export const WSEditorDefaultProps: WSEditorPropsOpts = {
    viewRowCount: 10,
    selectionMode: WSEditorSelectMode.Cell,
    selectionModeMulti: true,
    readonly: false,
    
    outlineCell: true,
    outlineCellStyle: "1px solid magenta",        
    cellBorder: true,
    cellBorderStyle:"1px solid #eeeeee",
    selectionBackground: "rgba(56,90,162,0.2)"
};