export interface WSEditorCellEditorBooleanOpts {
    label?: React.ReactNode;
    labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
    /** do not use material checkbox to increase rendering performance */
    noMaterial?: boolean;
    //controlJustify?: GridJustification;
}