import WSEditorColumn from "./WSEditorColumn";
import { WSEditorSelectMode } from "./WSEditorSelection";
import { WSEditorPropsOpts } from "./WSEditorDefaultProps";
import WSEditorCellCoord from "./WSEditorCellCoord";
 
export default interface WSEditorProps<T> extends WSEditorPropsOpts {
    sample3?: number;
    rows: T[];
    setRows: (newRows: any[]) => void;
    cols: WSEditorColumn<T>[];
    setCols: (newCols: WSEditorColumn<any>[]) => void;
    onCellDataChanged?: (rowData:T, cell: WSEditorCellCoord<T>, newData: any) => void;
}