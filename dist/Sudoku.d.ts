export declare type GameLevel = 'easy' | 'hard' | 'master' | 'medium';
export declare type Index = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export declare type Board = number[][];
export default class Sudoku {
    private readonly level;
    private readonly winnerBoard?;
    static emptyBoard(): Board;
    private currentBoard;
    private smartBoard;
    constructor(level?: GameLevel, winnerBoard?: number[][] | undefined);
    private newSolution;
}
//# sourceMappingURL=Sudoku.d.ts.map