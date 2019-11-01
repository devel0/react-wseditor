import { WSEditor } from "./WSEditor";

import { WSEditorColumn } from "./WSEditorColumn";

export interface WSEditorColumnHeaderProps<T> {
    editor: WSEditor<T>;
    col: WSEditorColumn<T>;
    cIdx: number;
}