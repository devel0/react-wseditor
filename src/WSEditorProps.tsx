import WSEditorColumn from "./WSEditorColumn";
import { WSEditorSelectMode } from "./WSEditorSelection";
import { WSEditorPropsOpts } from "./WSEditorDefaultProps";
 
export default interface WSEditorProps<T> extends WSEditorPropsOpts {
    sample3?: number;
    rows: T[];
    setRows: (newRows: any[]) => void;
    cols: WSEditorColumn<T>[];
    setCols: (newCols: WSEditorColumn<any>[]) => void;
}