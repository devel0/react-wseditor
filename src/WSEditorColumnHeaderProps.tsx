import { WSEditorColumn, WSEditor } from "./WSEditor";

export interface WSEditorColumnHeaderProps<T> {
    editor: WSEditor<T>;
    col: WSEditorColumn<T>;
    cIdx: number;
}