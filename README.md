# react-wseditor

> react worksheet like editor

[![NPM](https://img.shields.io/npm/v/react-wseditor.svg)](https://www.npmjs.com/package/react-wseditor) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-wseditor
```

## Example

- basic example ( [demo](https://codesandbox.io/s/github/devel0/react-wseditor-demo/tree/62b3c059ef2b76a1d040a312cce1813b253f9f93/test01) - [source](https://github.com/devel0/react-wseditor-demo/tree/master/test01) )
- customization example ( [demo](https://codesandbox.io/s/github/devel0/react-wseditor-demo/tree/ca7d3a7d18a9aed83e5fde5ee8ea61c6faf47803/test02) - [source](https://github.com/devel0/react-wseditor-demo/tree/master/test02) )

![](doc/react-wseditor-example.png)

## Features

- virtualized grid ( allow to manage millions of rows )
- [text][1]/[numeric][2]/[boolean][3] or [inline custom][15] cell controls
- easy to extend from base [cell editor][4]
- cell container and control [styles][14] can be overriden
- programmatic control of editor ( see example [add][5], [del][6] rows and scroll )
- [cell/row][7] selection mode ( [multiple selection][8] through mouse and ctrl key )
- worksheet like keyboard navigation ( cursor, home/end, ctrl+home/end, direct editing or F2, canc to delete cell content )
- sortable columns ( hold shift for multilevel sort ) with optional [custom sort][9]
- [column width][10] adjustable ( % or fixed )
- [initial sort][16]
- scroll horizontal if set editor width in an [overflow div][11]
- scrollbar [slider][12] can be hidden
- [readonly][13] mode
- [more ui style options](https://github.com/devel0/react-wseditor/blob/master/src/WSEditorDefaultProps.tsx)

[1]: https://github.com/devel0/react-wseditor/blob/master/src/WSEditorCellEditorText.tsx
[2]: https://github.com/devel0/react-wseditor/blob/master/src/WSEditorCellEditorNumber.tsx
[3]: https://github.com/devel0/react-wseditor/blob/master/src/WSEditorCellEditorBoolean.tsx
[4]: https://github.com/devel0/react-wseditor/blob/master/src/WSEditorCellEditor.tsx
[5]: https://github.com/devel0/react-wseditor-demo/blob/444c9d8399e220771175a6a2f679a6bd22253657/test02-dev/src/App.tsx#L249
[6]: https://github.com/devel0/react-wseditor-demo/blob/444c9d8399e220771175a6a2f679a6bd22253657/test02-dev/src/App.tsx#L257
[7]: https://github.com/devel0/react-wseditor-demo/blob/444c9d8399e220771175a6a2f679a6bd22253657/test02-dev/src/App.tsx#L269
[8]: https://github.com/devel0/react-wseditor-demo/blob/444c9d8399e220771175a6a2f679a6bd22253657/test02-dev/src/App.tsx#L270
[9]: https://github.com/devel0/react-wseditor-demo/blob/444c9d8399e220771175a6a2f679a6bd22253657/test02-dev/src/App.tsx#L62
[10]: https://github.com/devel0/react-wseditor-demo/blob/444c9d8399e220771175a6a2f679a6bd22253657/test02-dev/src/App.tsx#L61
[11]: https://github.com/devel0/react-wseditor-demo/blob/444c9d8399e220771175a6a2f679a6bd22253657/test02-dev/src/App.tsx#L272
[12]: https://github.com/devel0/react-wseditor/blob/37442b34654cb0b11f6a9c7b6d561b165686d577/src/WSEditorDefaultProps.tsx#L40
[13]: https://github.com/devel0/react-wseditor/blob/37442b34654cb0b11f6a9c7b6d561b165686d577/src/WSEditorDefaultProps.tsx#L32
[14]: https://github.com/devel0/react-wseditor-demo/blob/e53456bb58929d88ec9342bbcfff1805c328df7d/test02-dev/src/App.tsx#L279-L280
[15]: https://github.com/devel0/react-wseditor-demo/blob/ca906f7c7f659b1ce91795d22cea5f6f651c540a/test02/src/App.tsx#L61-L65
[16]: https://github.com/devel0/react-wseditor-demo/blob/e53456bb58929d88ec9342bbcfff1805c328df7d/test02-dev/src/App.tsx#L72-L73

## How to contribute (quickstart)

to establish development environment to contribute with PR see [here](https://github.com/devel0/react-wseditor-demo/blob/master/test01-dev/README.md#how-to-contribute-quickstart)

## development keynotes

to allow grid manage tons of rows was required by design to react only for view cells ( virtualized grid ) and manage mapping between rows data and cell views by pointing and converting view cell row index to data cell row index by a scroll offset information stored in editor state.

- editor
    - [props][100]
    - non templated [optional props][101]
    - [state][102] with info about scroll offset, focused view cell, selection, grid/header height
    - all displayed view cells are referenced through
        - a [map][103] for their [key][104] to cell [div element][108]
        - a [map][107] for their [key][104] to cell [editor element][109]
    - [view cell coord][105] can be converted to [data cell coord][106]
    - grid is created following this flow:
        - [main grid][110]
            - first row [headers][112]
            - [view rows][113] render that render in turn each [row editor][114]
        - [side slider][111]
- [row editor][115] is the point where [keyboard][116] [(2)][117], [mouse][118] [(2)][119] interactions happens
    - if key handled by engine then [current cell][124] could change and [editor set current cell][125] handler can handle to extend or replace current selection while row editor [represent cell/row selection][126] by changing style
    - finally row render [each cell][120] choosing between [default or custom][121] cell editor
- columns
    - toggle [sort][122] uses [editor sort handler][123]
- other keyboard/mouse managements points
    - [slider][127]
    - [horizontal scroll][128] and [workaround][129]

[100]: https://github.com/devel0/react-wseditor/blob/0721ca0e93e47215ea60b5d9c948fcdf79e156e0/src/WSEditorProps.tsx#L6
[101]: https://github.com/devel0/react-wseditor/blob/37442b34654cb0b11f6a9c7b6d561b165686d577/src/WSEditorDefaultProps.tsx#L4
[102]: https://github.com/devel0/react-wseditor/blob/16470e71bc7e0623cb020518ae7c0cee06322e36/src/WSEditor.tsx#L37
[103]: https://github.com/devel0/react-wseditor/blob/16470e71bc7e0623cb020518ae7c0cee06322e36/src/WSEditor.tsx#L49
[104]: https://github.com/devel0/react-wseditor/blob/49dfba2aa0927cdcd25a96ecd90568bba259e1c6/src/WSEditorViewCellCoord.tsx#L18
[105]: https://github.com/devel0/react-wseditor/blob/49dfba2aa0927cdcd25a96ecd90568bba259e1c6/src/WSEditorViewCellCoord.tsx#L16
[106]: https://github.com/devel0/react-wseditor/blob/d33c9cb0d8402aca0002b411fbe3910f5d6484cf/src/WSEditorCellCoord.tsx#L15
[107]: https://github.com/devel0/react-wseditor/blob/16470e71bc7e0623cb020518ae7c0cee06322e36/src/WSEditor.tsx#L61
[108]: https://github.com/devel0/react-wseditor/blob/37442b34654cb0b11f6a9c7b6d561b165686d577/src/WSEditorRow.tsx#L169
[109]: https://github.com/devel0/react-wseditor/blob/49dfba2aa0927cdcd25a96ecd90568bba259e1c6/src/WSEditorCellEditor.tsx#L26
[110]: https://github.com/devel0/react-wseditor/blob/16470e71bc7e0623cb020518ae7c0cee06322e36/src/WSEditor.tsx#L413-L441
[111]: https://github.com/devel0/react-wseditor/blob/16470e71bc7e0623cb020518ae7c0cee06322e36/src/WSEditor.tsx#L442-L485
[112]: https://github.com/devel0/react-wseditor/blob/16470e71bc7e0623cb020518ae7c0cee06322e36/src/WSEditor.tsx#L430-L435
[113]: https://github.com/devel0/react-wseditor/blob/16470e71bc7e0623cb020518ae7c0cee06322e36/src/WSEditor.tsx#L339
[114]: https://github.com/devel0/react-wseditor/blob/16470e71bc7e0623cb020518ae7c0cee06322e36/src/WSEditor.tsx#L349
[115]: https://github.com/devel0/react-wseditor/blob/37442b34654cb0b11f6a9c7b6d561b165686d577/src/WSEditorRow.tsx#L16
[116]: https://github.com/devel0/react-wseditor/blob/37442b34654cb0b11f6a9c7b6d561b165686d577/src/WSEditorRow.tsx#L33
[117]: https://github.com/devel0/react-wseditor/blob/37442b34654cb0b11f6a9c7b6d561b165686d577/src/WSEditorRow.tsx#L123
[118]: https://github.com/devel0/react-wseditor/blob/37442b34654cb0b11f6a9c7b6d561b165686d577/src/WSEditorRow.tsx#L22
[119]: https://github.com/devel0/react-wseditor/blob/37442b34654cb0b11f6a9c7b6d561b165686d577/src/WSEditorRow.tsx#L133
[120]: https://github.com/devel0/react-wseditor/blob/37442b34654cb0b11f6a9c7b6d561b165686d577/src/WSEditorRow.tsx#L147
[121]: https://github.com/devel0/react-wseditor/blob/37442b34654cb0b11f6a9c7b6d561b165686d577/src/WSEditorRow.tsx#L171-L181
[122]: https://github.com/devel0/react-wseditor/blob/37442b34654cb0b11f6a9c7b6d561b165686d577/src/WSEditorColumnHeader.tsx#L28
[123]: https://github.com/devel0/react-wseditor/blob/16470e71bc7e0623cb020518ae7c0cee06322e36/src/WSEditor.tsx#L220
[124]: https://github.com/devel0/react-wseditor/blob/37442b34654cb0b11f6a9c7b6d561b165686d577/src/WSEditorRow.tsx#L109
[125]: https://github.com/devel0/react-wseditor/blob/16470e71bc7e0623cb020518ae7c0cee06322e36/src/WSEditor.tsx#L156
[126]: https://github.com/devel0/react-wseditor/blob/37442b34654cb0b11f6a9c7b6d561b165686d577/src/WSEditorRow.tsx#L166
[127]: https://github.com/devel0/react-wseditor/blob/16470e71bc7e0623cb020518ae7c0cee06322e36/src/WSEditor.tsx#L454-L475
[128]: https://github.com/devel0/react-wseditor/blob/37442b34654cb0b11f6a9c7b6d561b165686d577/src/WSEditorRow.tsx#L25
[129]: https://github.com/devel0/react-wseditor/blob/37442b34654cb0b11f6a9c7b6d561b165686d577/src/WSEditorRow.tsx#L112

## how this project was built

```sh
npm create react-library react-wseditor --typescript
```
