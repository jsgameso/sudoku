import { Board } from '../Sudoku';
import { cloneBoard, randomBetween, randomSector, scatter, createWinnerBoard } from '../helpers';
import { SmartBoard } from '../../dist';

describe('cloneBoard', () => {
  /**
   * [
   *  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   *  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   *  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   *  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   *  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   *  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   *  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   *  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   *  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   *  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   * ]
  */
  const board: Board = Array(10).fill(Array(10).fill(0));

  it('Should create a new pure board', () => {
    const pureBoard = cloneBoard(board);

    // Modify [3, 5]
    pureBoard[5][3] = 1;

    expect(pureBoard).not.toEqual(board);
  });
});

describe('randomBetween', () => {
  const [min, max] = [3, 46];

  it('Should create only numbers between gived range', () => {
    // One million of results
    const results: number[] = Array(1000000).fill(0).map(() => randomBetween(min, max));

    const outTheRange: number[] = results.filter(value => value < min || value > max);

    expect(outTheRange.length).toBe(0);
  });

  it('Should ignore gived single value', () => {
    const ignore: number = randomBetween(min, max);

    const results: number[] = Array(1000000).fill(0).map(() => randomBetween(min, max, ignore));

    expect(results).not.toContain(ignore);
  });

  it('Should ignore gived list of values', () => {
    // 20 numbers to ignore
    const ignore: number[] = Array(20).fill(0).map(() => randomBetween(min, max));

    const results: number[] = Array(1000000).fill(0).map(() => randomBetween(min, max, ignore));

    const ignored = results.filter((val) => ignore.indexOf(val) !== -1);

    expect(ignored.length).toBe(0);
  });

  it('Should ignore gived list of values event if the list is empty', () => {
    // 0 numbers to ignore
    const ignore: number[] = [];

    const results: number[] = Array(1000000).fill(0).map(() => randomBetween(min, max, ignore));

    const ignored = results.filter((val) => ignore.indexOf(val) !== -1);

    expect(ignored.length).toBe(0);
  });

  it('Should throw an error if the ignore list contains any not number value', () => {
    const ignore: number[] = [1, 2, '3'] as number[];
    const error = new Error('Invalid operation');

    expect(() => randomBetween(min, max, ignore)).toThrowError(error);
  });

  it('Should throw an error if the ignore type doesn\'t match with number | number[]', () => {
    const error = new Error('Invalid operation');

    // @ts-ignore
    expect(() => randomBetween(min, max, '')).toThrowError(error);
  });
});

describe('randomSector', () => {
  it('Should create an array with 9 elements', () => {
    const sector = randomSector();

    expect(sector).toHaveLength(9);
    expect(sector.reduce((a, b) => a + b)).toBe(45);
  });
});

describe('scatter', () => {
  it('Should return an array with 9 elements', () => {
    const threshold = randomBetween(35, 55);

    const result = scatter(threshold);

    expect(result).toHaveLength(9);
  });

  it('Should always sum the threshold', () => {
    Array(10000).fill(0).forEach(() => {
      const threshold = randomBetween(35, 55);
  
      const result = scatter(threshold);
  
      expect(Number(result.reduce((a, b) => a + b))).toBe(Number(threshold));
    });
  });
});

describe('createWinnerBoard', () => {
  it('Should return a SmartBoard instance', () => {
    const solution = createWinnerBoard();

    expect(solution).toBeInstanceOf(SmartBoard);
  });

  it('Should create a board solved', () => {
    const solution = createWinnerBoard();

    solution.smartSectorList.forEach((sector) => {
      expect(sector.toArray().reduce((a, b) => a + b)).toBe(45);
    });
    expect(solution.smartFieldList.map(({ value }) => value).reduce((a, b) => a + b)).toBe(405);

    solution.smartFieldList.forEach((field) => {
      expect(field.validate(field.value)).toBeTruthy();
    });
  });
});
