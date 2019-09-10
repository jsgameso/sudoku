import { Board } from "./Sudoku";
export interface SmartField {
    globalCoordinates: [number, number];
    globalIndex: number;
    index: number;
    sameHorizontal: SmartField[];
    sameSector: SmartField[];
    sameVertical: SmartField[];
    sector: SmartSector;
    validate: (value: number) => boolean;
    value: number;
}
export interface SmartSector {
    fields: SmartField[];
    index: number;
    setValues: (values: number[]) => void;
    toArray: () => number[];
}
export default class SmartBoard {
    smartFieldList: SmartField[];
    smartSectorList: SmartSector[];
    constructor(board?: number[][]);
    board: Board;
    setValues(values: Board): void;
    resetValues(): void;
    getSmartSector(index: number): SmartSector;
    getSector(index: number): number[];
    private createSmartField;
    private createSmartSector;
    private calculateSameIn;
}
//# sourceMappingURL=SmartBoard.d.ts.map