import { WSEditorSelectMode } from "./WSEditorSelection";
import { CSSProperties } from "@material-ui/styles";
import WSEditor from "./WSEditor";
import { WSEditorColumnHeaderProps } from "./WSEditorColumnHeader";
import WSEditorViewCellCoord from "./WSEditorViewCellCoord";

export interface WSEditorPropsOpts<T> {
    viewRowCount?: number;
    viewRowCountFixed?: boolean;
    selectionMode?: WSEditorSelectMode;
    selectionModeMulti?: boolean;
    readonly?: boolean;
    hideSlider?: boolean;
    cellMargin?: string | number;
    sliderWheelDivisionStep?: number;
    debug?: boolean;
    width?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;

    frameStyle?: CSSProperties;
    headerCellStyle?: (props: WSEditorColumnHeaderProps<T>, defaltStyle: CSSProperties) => CSSProperties;
    currentCellContainerStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => CSSProperties;
    selectionStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => CSSProperties;
    cellContainerStyleBase?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>) => CSSProperties;
    cellContainerStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>, defaultStyle: CSSProperties) => CSSProperties;
    cellControlStyle?: (editor: WSEditor<T>, viewCell: WSEditorViewCellCoord<T>, defaultStyle: CSSProperties) => CSSProperties;
}

export default function WSEditorDefaultProps() {
    return {
        viewRowCount: 10,
        viewRowCountFixed: false,
        selectionMode: WSEditorSelectMode.Cell,
        selectionModeMulti: true,
        readonly: false,
        hideSlider: false,
        cellMargin: 2,
        sliderWheelDivisionStep: 15,
        debug: false,
        width: "100%",

        frameStyle: {
            borderTop: 0,
            overflow: "auto",
            border: "1px solid #a0a0a0"
            //border: "1px solid green"
        },
        headerCellStyle: (props) => {
            return {
                margin: 0,
                padding: "5px",
                background: "#eeeeee",
                borderStyle: "solid",
                borderLeft: "0",
                borderTop: "0",
                borderRight: props.cIdx !== props.editor.props.cols.length - 1 ? "1px solid #a0a0a0" : "0",
                borderBottom: "1px solid #a0a0a0",
                cursor: "pointer"
            }
        },
        currentCellContainerStyle: (editor, viewCell) => {
            return {
                border: "1px solid rgba(56,90,162,0.8)"
            }
        },
        cellContainerStyleBase: (editor, viewCell) => {
            return {
                borderStyle: "solid",
                borderLeft: "0",
                borderTop: "0",
                borderRight: viewCell.viewColIdx !== editor.props.cols.length - 1 ? "1px solid #eeeeee" : "0",
                borderBottom: "1px solid #eeeeee",
                lineHeight: "2em"
            }
        },
        selectionStyle: (editor, viewCell) => {
            return {
                background: "rgba(56,90,162,0.2)"
            }
        },
        cellContainerStyle: (editor, viewCell) => {
            return {

            }
        },
        cellControlStyle: (editor, viewCell) => {
            return {
                margin: "5px"
            }
        },
    } as WSEditorPropsOpts<any>
}