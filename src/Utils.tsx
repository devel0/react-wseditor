export enum SortDirection { Ascending, Descending };

export enum WSEditorSelectMode { Cell, Row }

export function stringIsValidNumber(n: string) {
    const q = n.match(/^[-+]?\d*(\.\d*)?([eE][-+]?\d+)?$/);

    return (q && q.length > 0) || false;
}
