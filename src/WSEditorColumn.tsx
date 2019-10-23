import WSEditorCellEditor, { WSEditorCellEditorProps } from "./WSEditorCellEditor";
import WSEditor from "./WSEditor";
import WSEditorViewCellCoord from "./WSEditorViewCellCoord";

export enum SortDirection { Ascending, Descending };

export default interface WSEditorColumn<T> {
    header: string;
    field: string;
    editor?: (props: WSEditorCellEditorProps<T>, editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => WSEditorCellEditor<T>;
    /** set from editor */
    viewColIdx?: number;
    sortDir?: SortDirection;
    sortOrder?: number;
    readonly?: boolean;
}
