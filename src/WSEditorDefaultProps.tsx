import { WSEditorSelectMode } from "./Utils"

import { WSEditorPropsOpts } from "./WSEditorPropsOpts"

export function WSEditorDefaultProps() {
    return {
        viewRowCount: 10,
        selectionMode: WSEditorSelectMode.Cell,
        selectionModeMulti: true,
        readonly: false,
        hideSlider: false,
        disableScrollLock: false,        
        sliderWheelDivisionStep: 15,
        debug: false,
        width: "100%",

        gridCellStyle: (editor, viewCell) => {
            return {
                outline: 0,
                margin: "0px",
                borderLeft: "1px solid transparent",
                borderTop: "1px solid transparent",
                borderRight: viewCell.viewColIdx !== editor.props.cols.length - 1 ? "1px solid #eeeeee" : "0",
                borderBottom: "1px solid #eeeeee",
                overflow: "hidden", textOverflow: "ellipsis"
            }
        },
        gridCellFocusedStyle: (editor, viewCell) => {
            return {
                border: "1px solid rgba(56,90,162,0.8)"
            }
        },
        gridRowFocusedStyle: (editor, viewCell) => {
            return {
                borderTop: "1px solid rgba(56,90,162,0.8)",
                borderBottom: "1px solid rgba(56,90,162,0.8)",
                borderRight: viewCell.viewColIdx === editor.props.cols.length - 1 ? "1px solid rgba(56,90,162,0.8)" : "1px solid transparent",
                borderLeft: viewCell.viewColIdx === 0 ? "1px solid rgba(56,90,162,0.8)" : "1px solid transparent",
            }
        },
        selectionStyle: (editor, viewCell) => {
            return {
                background: "rgba(56,90,162,0.2)",
                outline: 0,
                overflow: "hidden", textOverflow: "ellipsis"
            }
        },
        cellContainerHoverStyle: (editor, viewCell) => {
            return {
                // background: "rgba(56,90,162,0.1)"
            }
        },
        cellContainerStyle: (editor, viewCell) => {
            return {
                verticalAlign: "middle",
            }
        },
        cellControlStyle: (editor, viewCell) => {
            return {
                margin: "5px",
            }
        },

        headerCellStyle: (props) => {
            return {
                margin: 0,
                padding: "5px",
                background: "#eeeeee",
                borderStyle: "solid",
                borderLeft: "0px solid #a0a0a0",
                borderTop: "0px solid #a0a0a0",
                borderRight: props.cIdx !== props.editor.props.cols.length - 1 ? "1px solid #a0a0a0" : "0",
                borderBottom: "1px solid #a0a0a0",
                cursor: "pointer",
                overflow: "hidden", textOverflow: "ellipsis"
            }
        },
        headerControlStyle: (props) => {
            return {
                lineHeight: undefined,
                margin: "5px",
            }
        },
        frameStyle: () => {
            return {
            }
        },
        tableStyle: () => {
            return {
                borderTop: 0,
                overflow: "auto",
                border: "1px solid #a0a0a0",
                //padding: 1                       
            }
        },
    } as WSEditorPropsOpts<any>
}