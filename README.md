# react-wseditor

> react worksheet like editor

[![NPM](https://img.shields.io/npm/v/react-wseditor.svg)](https://www.npmjs.com/package/react-wseditor) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-wseditor
```

## Features

- virtualized grid ( allow to manage millions of rows )
- [text](https://github.com/devel0/react-wseditor/blob/master/src/WSEditorCellEditorText.tsx)/[numeric](https://github.com/devel0/react-wseditor/blob/master/src/WSEditorCellEditorNumber.tsx)/[boolean](https://github.com/devel0/react-wseditor/blob/master/src/WSEditorCellEditorBoolean.tsx) cell controls
- easy to extend from base [cell editor](https://github.com/devel0/react-wseditor/blob/master/src/WSEditorCellEditor.tsx)
- programmatic control of editor ( see example add,del rows and scroll )
- cell/row selection mode ( multiple selection through mouse and ctrl key )
- worksheet like keyboard navigation ( cursor, home/end, ctrl+home/end, direct editing or F2, canc to delete cell content )
- sortable columns ( hold shift for multilevel sort )
- scrollbar
- [options](https://github.com/devel0/react-wseditor/blob/master/src/WSEditorDefaultProps.tsx)

## How to contribute (quickstart)

```sh
git clone https://github.com/devel0/react-wseditor-demo.git
cd react-wseditor-demo
cd test01-dev
git submodule update --init --recursive
git submodule foreach git pull origin master
yarn install
code .
```

from vscode open terminal ctrl+`

```sh
yarn install
yarn start
```

when read hit F5 to debug with chrome ( [more info](https://github.com/devel0/react-wseditor-demo/blob/master/test01-dev/README.md) )

## Example

- [LIVE DEMO](https://codesandbox.io/s/github/devel0/react-wseditor-demo/tree/93e4a612fee185bcb67b68058b6f5a15fc7cecc9/test01)

- [test01 SOURCE CODE](https://github.com/devel0/react-wseditor-demo/tree/master/test01)

![](doc/react-wseditor-example.png)

## how this project was built

```sh
npm create react-library react-wseditor --typescript
```
