import { WSEditorCellEditorPropsOpts } from "./WSEditorCellEditorPropsOpts";

import { WSEditor } from "./WSEditor";

import { WSEditorViewCellCoord } from "./WSEditorViewCellCoord";

export interface WSEditorCellEditorProps<T> extends WSEditorCellEditorPropsOpts {
    data: any;
    cellContainerStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>, defaultStyle: React.CSSProperties) => React.CSSProperties;
    cellControlStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>, defaultStyle: React.CSSProperties) => React.CSSProperties;
}
