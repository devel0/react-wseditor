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
- [options](https://github.com/devel0/react-wseditor/blob/master/src/WSEditorDefaultProps.tsx)

## Example

[LIVE DEMO](https://codesandbox.io/s/github/devel0/react-wseditor-demo/tree/1f242922347ad80ff84869f13c68cf4a784a28de/test01)

![](doc/react-wseditor-example.png)

```tsx
import { useState } from "react";
import React from "react";
import { Grid, TextField, Button, Typography, makeStyles, FormControlLabel, Checkbox } from '@material-ui/core';
import {
  WSEditor, WSEditorColumn, WSEditorCellEditorProps, WSEditorViewCellCoord,
  WSEditorCellEditorText, WSEditorCellEditorNumber, WSEditorCellEditorBoolean, WSEditorSelectMode
} from 'react-wseditor';

interface MyData {
  col1: string,
  col2: string,
  col3: number,
  col4: boolean
}

export default function ExampleComponent() {
  const [ROWS_COUNT, SET_GRID_SIZE] = useState(12);
  const [GRID_VIEW_ROWS, SET_GRID_VIEW_ROWS] = useState(6);
  const [SELECT_MODE_ROWS, SET_SELECT_MODE_ROWS] = useState(false);
  const [rows, setRows] = useState<MyData[]>([]);
  const [cols, setCols] = useState<WSEditorColumn<MyData>[]>([]);

  const q1: MyData[] = [];

  React.useEffect(() => {
    for (let i = 0; i < ROWS_COUNT; ++i) {
      q1.push({ col1: 'grp nr ' + Math.trunc(i / 10), col2: 'x' + i, col3: i, col4: true });
    }
    setRows(q1);
    const q2: WSEditorColumn<MyData>[] = [
      {
        header: "column 1 (text default)",
        field: "col1",
      },
      {
        header: "column 2 (text)",
        field: "col2",
        editor: (props: WSEditorCellEditorProps<MyData>, editor: WSEditor<MyData>, viewCell: WSEditorViewCellCoord<MyData>) =>
          new WSEditorCellEditorText(props, editor, viewCell),
      },
      {
        header: "column 3 (number)",
        field: "col3",
        editor: (props: WSEditorCellEditorProps<MyData>, editor: WSEditor<MyData>, viewCell: WSEditorViewCellCoord<MyData>) =>
          new WSEditorCellEditorNumber(props, editor, viewCell),
      },
      {
        header: "column 4 (boolean)",
        field: "col4",
        editor: (props: WSEditorCellEditorProps<MyData>, editor: WSEditor<MyData>, viewCell: WSEditorViewCellCoord<MyData>) =>
          new WSEditorCellEditorBoolean(props, editor, viewCell),
      },
    ];
    setCols(q2);
  }, [ROWS_COUNT]);

  const useStyles = makeStyles({
    smallTextField: {
      width: 50
    },
    maginLeft1: {
      marginLeft: "1em"
    }
  });

  const classes = useStyles({});
  const editorRef = React.useRef<WSEditor<MyData>>(null);

  return <>
    <Grid container={true} direction="column">
      <Grid item={true}>
        <Grid container={true} direction="row">
          <Grid item={true} xs="auto">
            <Typography>Rows count</Typography>
          </Grid>
          <Grid item={true} xs="auto" className={classes.maginLeft1}>
            <TextField className={classes.smallTextField} value={ROWS_COUNT} onChange={(v) => {
              const n = parseInt(v.target.value);
              if (!isNaN(n)) SET_GRID_SIZE(parseInt(v.target.value));
            }} />
          </Grid>
          <Grid item={true} xs="auto" className={classes.maginLeft1}>
            <Typography>Grid view rows</Typography>
          </Grid>
          <Grid item={true} xs="auto" className={classes.maginLeft1}>
            <TextField className={classes.smallTextField} value={GRID_VIEW_ROWS} onChange={(v) => {
              const n = parseInt(v.target.value);
              if (!isNaN(n)) SET_GRID_VIEW_ROWS(n);
            }} />
          </Grid>
          <Grid item={true} xs="auto">
            <FormControlLabel
              control={
                <Checkbox
                  checked={SELECT_MODE_ROWS}
                  onChange={(v) => SET_SELECT_MODE_ROWS(v.target.checked)}
                  value="checkedF"
                />
              }
              label="Select mode rows"
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item={true} xs={12}>
        <Grid container={true} direction="row">
          <Button color="primary" onClick={() => {
            if (editorRef.current) {
              const editor = editorRef.current;
              const newRowsCount = editor.props.rows.length + 1;
              const addedRowIdx = editor.addRow({ col1: "new row", col2: "", col3: 0, col4: false } as MyData, true);
              editor.scrollToRow(addedRowIdx, newRowsCount);
              editor.selectRow(addedRowIdx, newRowsCount);
            }
          }}>add row</Button>
          <Button color="primary" onClick={() => {
            if (editorRef.current) {
              const editor = editorRef.current;
              editor.deleteRows(editor.selectedRows());
            }
            //const q = rows.splice(
          }}>delete rows</Button>
        </Grid>
      </Grid>
      <Grid item={true} xs={12}>
        <WSEditor
          ref={editorRef}
          rows={rows} setRows={setRows}
          cols={cols} setCols={setCols}
          selectionMode={SELECT_MODE_ROWS ? WSEditorSelectMode.Row : WSEditorSelectMode.Cell}
          viewRowCount={GRID_VIEW_ROWS}
          outlineCell={false}
        />
      </Grid>
    </Grid>
  </>
}
```

## how this project was built

```sh
npm create react-library react-wseditor --typescript
```
