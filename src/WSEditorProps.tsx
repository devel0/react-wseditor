import WSEditorColumn from "./WSEditorColumn";
import WSEditorSelection from "./WSEditorSelection";
import { WSEditorPropsOpts } from "./WSEditorDefaultProps";
import WSEditorCellCoord from "./WSEditorCellCoord";
import WSEditor, { WSEditorRowInfo } from "./WSEditor";

export default interface WSEditorProps<T> extends WSEditorPropsOpts<T> {
    rows: T[];
    setRows: (newRows: any[]) => void;
    cols: WSEditorColumn<T>[];
    setCols: (newCols: WSEditorColumn<any>[]) => void;

    onCellDataChanged?: (editor: WSEditor<T>, rowData: T, cell: WSEditorCellCoord<T>, newData: any) => void;
    onSelectionChanged?: (editor: WSEditor<T>, selection: WSEditorSelection<T>) => void;
    onCellClicked?: (editor: WSEditor<T>, cell: WSEditorCellCoord<T>, e: React.MouseEvent<HTMLDivElement>) => void;
    onRowsAdded?: (editor: WSEditor<T>, rows: WSEditorRowInfo<T>[]) => void;
    onRowsDeleted?: (editor: WSEditor<T>, rows: WSEditorRowInfo<T>[]) => void;

}