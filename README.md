# react-wseditor

> react worksheet like editor

[![NPM](https://img.shields.io/npm/v/react-wseditor.svg)](https://www.npmjs.com/package/react-wseditor) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-wseditor
```

## Example

- live [DEMO](https://codesandbox.io/s/github/devel0/react-wseditor-demo/tree/62b3c059ef2b76a1d040a312cce1813b253f9f93/test01)

- example [SOURCE](https://github.com/devel0/react-wseditor-demo/tree/master/test01)

![](doc/react-wseditor-example.png)

## Features

- virtualized grid ( allow to manage millions of rows )
- [text][1]/[numeric][2]/[boolean][3] cell controls
- easy to extend from base [cell editor][4]
- programmatic control of editor ( see example [add][5], [del][6] rows and scroll )
- [cell/row][7] selection mode ( [multiple selection][8] through mouse and ctrl key )
- worksheet like keyboard navigation ( cursor, home/end, ctrl+home/end, direct editing or F2, canc to delete cell content )
- sortable columns ( hold shift for multilevel sort ) with optional [custom sort][9]
- [column width][10] adjustable ( % or fixed )
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

## How to contribute (quickstart)

to establish development environment to contribute with PR see [here](https://github.com/devel0/react-wseditor-demo/blob/master/test01-dev/README.md#how-to-contribute-quickstart)

development keynotes:
- [sample][1]

[1]: https://github.com/devel0/react-wseditor/blob/0721ca0e93e47215ea60b5d9c948fcdf79e156e0/src/WSEditorProps.tsx#L6

## how this project was built

```sh
npm create react-library react-wseditor --typescript
```
