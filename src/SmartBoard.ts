import Sudoku, { Board } from "./Sudoku";

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
  public smartFieldList: SmartField[] = [];
  public smartSectorList: SmartSector[];

  constructor(board: number[][] = Sudoku.emptyBoard()) {
    this.smartSectorList = board.map(this.createSmartSector.bind(this));
  }

  public get board(): Board {
    return this.smartSectorList.map(smartSector => smartSector.toArray());
  }

  public set board(board: Board) {
    this.setValues(board);
  }

  public setValues(values: Board) {
    values.forEach((sector, sectorIx) => {
      this.getSmartSector(sectorIx).setValues(sector);
    });
  }

  public resetValues() {
    this.smartFieldList.forEach((smartField) => {
      smartField.value = 0;
    });
  }

  public getSmartSector(index: number): SmartSector {
    const search = this.smartSectorList.find(smartSector => smartSector.index === index);

    return search || this.smartSectorList[index];
  }

  public getSector(index: number): number[] {
    return this.getSmartSector(index).toArray();
  }

  private createSmartField(value: number, index: number, sector: SmartSector): SmartField {
    const [x, y] = [
      ((sector.index % 3) * 3) + index % 3,
      (Math.floor(sector.index / 3) * 3) + Math.floor(index / 3),
    ];
    const globalIndex = Number(`${y}${x}`);

    const smartField = {
      globalCoordinates: [x, y],
      globalIndex,
      index,
      sameHorizontal: [] as SmartField[],
      sameSector: [] as SmartField[],
      sameVertical: [] as SmartField[],
      sector,
      value,
    } as SmartField;

    // This exact same function will be used 3 times
    const mapValue = (f: SmartField) => f.value;

    smartField.validate = (val: number) => {
      // Check if the value isn't in the horizontal
      const isNotInHorizontal = !smartField.sameHorizontal.map(mapValue).includes(val);
      // Check if the value isn't in the sector
      const isNotInSector = !smartField.sameSector.map(mapValue).includes(val);
      // Check if the value isn't in the vertical
      const isNotInVertical = !smartField.sameVertical.map(mapValue).includes(val);

      // If everything is true return it, otherwise false
      const result = isNotInHorizontal && isNotInSector && isNotInVertical;

      return result;
    }

    this.smartFieldList.push(smartField);
    if (this.smartFieldList.length === (9 * 9)) {
      this.calculateSameIn();
    }

    return smartField;
  }

  private createSmartSector(sector: number[], index: number): SmartSector {
    const smartSector = {
      index,
    } as SmartSector;

    smartSector.fields = sector.map((value, index) => this.createSmartField(value, index, smartSector));
    smartSector.toArray = () => smartSector.fields.map((field) => field.value);
    smartSector.setValues = (values: number[]) => {
      values.forEach((value, index) => {
        smartSector.fields[index].value = value;
      });
    };

    return smartSector;
  }

  private calculateSameIn() {
    this.smartFieldList.forEach((field) => {
      field.sameHorizontal = this.smartFieldList.filter(({ globalCoordinates, globalIndex }) => {
        // For horizontal take all the fields with the same y axis of its globalCoordinates excluding the current field
        const [ox, oy] = globalCoordinates;
        const [cx, cy] = field.globalCoordinates;
  
        return oy === cy && field.globalIndex !== globalIndex;
      });

      field.sameVertical = this.smartFieldList.filter(({ globalCoordinates, globalIndex }: SmartField) => {
        // For horizontal take all the fields with the same x axis of its globalCoordinates excluding the current field
        const [ox] = globalCoordinates;
        const [cx] = field.globalCoordinates;
  
        return ox === cx && field.globalIndex !== globalIndex;
      });

      field.sameSector = this.smartFieldList.filter(({ sector, globalIndex }) => {
        return field.sector.index === sector.index && field.globalIndex !== globalIndex;
      });
    });

    this.smartFieldList.sort((a, b) => a.globalIndex - b.globalIndex);
  }
}
