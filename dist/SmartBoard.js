"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Sudoku_1 = __importDefault(require("./Sudoku"));
class SmartBoard {
    constructor(board = Sudoku_1.default.emptyBoard()) {
        this.smartFieldList = [];
        this.smartSectorList = board.map(this.createSmartSector.bind(this));
    }
    get board() {
        return this.smartSectorList.map(smartSector => smartSector.toArray());
    }
    set board(board) {
        this.setValues(board);
    }
    setValues(values) {
        values.forEach((sector, sectorIx) => {
            this.getSmartSector(sectorIx).setValues(sector);
        });
    }
    resetValues() {
        this.smartFieldList.forEach((smartField) => {
            smartField.value = 0;
        });
    }
    getSmartSector(index) {
        const search = this.smartSectorList.find(smartSector => smartSector.index === index);
        return search || this.smartSectorList[index];
    }
    getSector(index) {
        return this.getSmartSector(index).toArray();
    }
    createSmartField(value, index, sector) {
        const [x, y] = [
            ((sector.index % 3) * 3) + index % 3,
            (Math.floor(sector.index / 3) * 3) + Math.floor(index / 3),
        ];
        const globalIndex = Number(`${y}${x}`);
        const smartField = {
            globalCoordinates: [x, y],
            globalIndex,
            index,
            sameHorizontal: [],
            sameSector: [],
            sameVertical: [],
            sector,
            value,
        };
        const mapValue = (f) => f.value;
        smartField.validate = (val) => {
            const isNotInHorizontal = !smartField.sameHorizontal.map(mapValue).includes(val);
            const isNotInSector = !smartField.sameSector.map(mapValue).includes(val);
            const isNotInVertical = !smartField.sameVertical.map(mapValue).includes(val);
            const result = isNotInHorizontal && isNotInSector && isNotInVertical;
            return result;
        };
        this.smartFieldList.push(smartField);
        if (this.smartFieldList.length === (9 * 9)) {
            this.calculateSameIn();
        }
        return smartField;
    }
    createSmartSector(sector, index) {
        const smartSector = {
            index,
        };
        smartSector.fields = sector.map((value, index) => this.createSmartField(value, index, smartSector));
        smartSector.toArray = () => smartSector.fields.map((field) => field.value);
        smartSector.setValues = (values) => {
            values.forEach((value, index) => {
                smartSector.fields[index].value = value;
            });
        };
        return smartSector;
    }
    calculateSameIn() {
        this.smartFieldList.forEach((field) => {
            field.sameHorizontal = this.smartFieldList.filter(({ globalCoordinates, globalIndex }) => {
                const [ox, oy] = globalCoordinates;
                const [cx, cy] = field.globalCoordinates;
                return oy === cy && field.globalIndex !== globalIndex;
            });
            field.sameVertical = this.smartFieldList.filter(({ globalCoordinates, globalIndex }) => {
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
exports.default = SmartBoard;
//# sourceMappingURL=SmartBoard.js.map