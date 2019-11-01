import { WSEditorViewCellCoord, WSEditorCellEditorPropsOpts, WSEditor } from "./WSEditor";

export interface WSEditorCellEditorProps<T> extends WSEditorCellEditorPropsOpts {
    data: any;
    cellContainerStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>, defaultStyle: React.CSSProperties) => React.CSSProperties;
    cellControlStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>, defaultStyle: React.CSSProperties) => React.CSSProperties;
}
