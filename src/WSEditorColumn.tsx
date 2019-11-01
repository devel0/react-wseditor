import { GridJustification, GridItemsAlignment } from "@material-ui/core/Grid";
import { WSEditorCellEditorProps } from "./WSEditorCellEditorProps";
import { WSEditor } from "./WSEditor";
import { WSEditorViewCellCoord } from "./WSEditorViewCellCoord";
import { WSEditorCellEditor } from "./WSEditorCellEditor";
import { SortDirection } from "./Utils";
import { WSEditorColumnHeader } from "./WSEditorColumnHeader";

export interface WSEditorColumn<T> {
    header: string;
    field: keyof T | undefined;
    defaultEditor?: "text-readonly" | "text" | "boolean" | "number";
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
    cellContainerStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    cellControlStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => React.CSSProperties;
    justify?: GridJustification;
    alignItems?: GridItemsAlignment;
    colHeader?: WSEditorColumnHeader<T>;
}
