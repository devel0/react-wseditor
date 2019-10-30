import { GridJustification, GridItemsAlignment } from "@material-ui/core/Grid";

export interface WSEditorCellEditorPropsOpts<T> {
    justify?: GridJustification;
    alignItems?: GridItemsAlignment;
}

export default function WSEditorCellEditorDefaultProps() {
    return {
        justify: "center",
        alignItems: "center"
    } as WSEditorCellEditorPropsOpts<any>
}