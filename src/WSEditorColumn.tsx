import WSEditorCellEditor, { WSEditorCellEditorProps } from "./WSEditorCellEditor";
import WSEditor from "./WSEditor";
import WSEditorViewCellCoord from "./WSEditorViewCellCoord";
import { CSSProperties } from "@material-ui/styles";

export enum SortDirection { Ascending, Descending };

export default interface WSEditorColumn<T> {
    header: string;
    field: string;
    editor?: (props: WSEditorCellEditorProps<T>, editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => WSEditorCellEditor<T>;
    /** set from editor */
    viewColIdx?: number;
    sortDir?: SortDirection;
    sortOrder?: number;
    sortFn?: (a: T, b: T, dir: SortDirection) => number;
    readonly?: boolean;
    minWidth?: number | string;
    maxWidth?: number | string;
    width?: number | string;
    cellContainerStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => CSSProperties;
    cellControlStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => CSSProperties;
}
