import { WSEditor } from "./WSEditor";

export interface WSEditorRowProps<T> {
    viewRowIdx: number;
    editor: WSEditor<T>;
}
