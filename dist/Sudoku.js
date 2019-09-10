"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const SmartBoard_1 = __importDefault(require("./SmartBoard"));
class Sudoku {
    constructor(level = 'medium', winnerBoard) {
        this.level = level;
        this.winnerBoard = winnerBoard;
        const hidden = {
            easy: helpers_1.randomBetween(32, 39),
            hard: helpers_1.randomBetween(48, 53),
            master: helpers_1.randomBetween(54, 55),
            medium: helpers_1.randomBetween(40, 47),
        };
        const hideFields = helpers_1.scatter(hidden[this.level]);
        console.log({ hideFields });
        this.currentBoard = this.newSolution().map((sector, sectorIx) => {
            const workingSector = [...sector];
            const taken = [];
            let left = hideFields[sectorIx];
            while (left > 0) {
                const position = helpers_1.randomBetween(0, 8, taken);
                workingSector[position] = 0;
                left -= 1;
            }
            return workingSector;
        });
        this.smartBoard = new SmartBoard_1.default(this.currentBoard);
    }
    static emptyBoard() {
        return helpers_1.cloneBoard(Array(9).fill(Array(9).fill(0)));
    }
    newSolution() {
        const smartBoard = new SmartBoard_1.default();
        const trySolution = (previousSeed) => {
            smartBoard.resetValues();
            const seed = previousSeed || helpers_1.randomSector();
            smartBoard.getSmartSector(4).setValues(seed);
            const fill = () => {
                for (let value = 1; value < 10; value += 1) {
                    smartBoard.smartSectorList.forEach((smartSector) => {
                        if (smartSector.index !== 4) {
                            const taken = [];
                            let candidate = helpers_1.randomBetween(0, 8, taken);
                            while (smartSector.fields[candidate].value !== 0 || !smartSector.fields[candidate].validate(value)) {
                                if (taken.length === 9) {
                                    throw new Error('Imposible');
                                }
                                candidate = helpers_1.randomBetween(0, 8, taken);
                                taken.push(candidate);
                            }
                            smartSector.fields[candidate].value = value;
                        }
                    });
                }
            };
            try {
                fill();
            }
            catch (error) {
                trySolution(seed);
            }
        };
        trySolution();
        const solution = smartBoard.board;
        return solution;
    }
}
exports.default = Sudoku;
//# sourceMappingURL=Sudoku.js.map