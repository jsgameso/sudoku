import { cloneBoard, randomBetween, randomSector, scatter, createWinnerBoard } from "./helpers";
import SmartBoard, { SmartField } from "./SmartBoard";

export type GameLevel = 'easy' | 'hard' | 'master' | 'medium';
export type GameStatus = 'active' | 'loose' | 'win' | 'cheater';
export type Board = number[][];
export interface Relative {
  sectorIx: number;
  fieldIx: number;
}
export interface Relatives {
  sameHorizontal: Relative[];
  sameSector: Relative[];
  sameVertical: Relative[];
}
export interface Solution {
  getSolution: () => Board;
  gameBoard: Board;
}

export default class Sudoku {
  /**
   * Method to create an empty board
   *
   * @static
   * @returns {Board}
   * @memberof Sudoku
   */
  public static emptyBoard(): Board {
    return cloneBoard(Array(9).fill(Array(9).fill(0)));
  }

  // Function to get the solution of the current board
  private getSolution: () => Board;
  // Current game status
  private currentStatus: GameStatus = 'active';
  // Current board
  private currentBoard: Board;
  // SmartBoard with the current board values
  private smartBoard: SmartBoard;

  constructor(
    private level: GameLevel = 'medium',
    private readonly winnerBoard?: Board,
  ) {
    const solution = this.createSolution();

    this.getSolution = solution.getSolution;
    this.currentBoard = solution.gameBoard;
    this.smartBoard = new SmartBoard(this.currentBoard);
  }

  /**
   * Get last board
   *
   * @readonly
   * @type {Board}
   * @memberof Sudoku
   */
  public get board(): Board {
    return cloneBoard(this.currentBoard);
  }
  
  /**
   * Get the solution and loose the game
   *
   * @readonly
   * @type {Board}
   * @memberof Sudoku
   */
  public get solution(): Board {
    return this.getSolution();
  }

  /**
   * Function to create a new game with different level in the same instance 
   *
   * @param {GameLevel} [level=this.level]
   * @memberof Sudoku
   */
  public newGame(level: GameLevel = this.level) {
    this.level = level;
    const solution = this.createSolution();

    this.getSolution = solution.getSolution;
    this.currentBoard = solution.gameBoard;
    this.smartBoard = new SmartBoard(this.currentBoard);
  }

  /**
   * Method to set a value in a specific field. Returns if the value is valid
   *
   * @param {number} sectorIx
   * @param {number} fieldIx
   * @param {number} value
   * @returns {Boolean}
   * @memberof Sudoku
   */
  public setValue(sectorIx: number, fieldIx: number, value: number): Boolean {
    if (this.currentStatus === 'active') {
      // Get the SmartField
      const smartField = this.smartBoard.getSmartSector(sectorIx).fields[fieldIx];
      // Set the value in the SmartField
      smartField.value = value;
  
      // Set the last board
      this.currentBoard = this.smartBoard.board;
  
      // Return the validation result
      return smartField.validate(value);
    } else {
      return false
    }
  }

  /**
   * Method to validate value in a specific field
   *
   * @param {number} sectorIx
   * @param {number} fieldIx
   * @returns {Boolean}
   * @memberof Sudoku
   */
  public validateField(sectorIx: number, fieldIx: number): Boolean {
    // Get the SmartField
    const smartField = this.smartBoard.getSmartSector(sectorIx).fields[fieldIx];

    // Return the validation result with the current value
    return smartField.validate(smartField.value);
  }

  /**
   * Method to get all the relative positions
   *
   * @param {number} sectorIx
   * @param {number} fieldIx
   * @returns {Relatives}
   * @memberof Sudoku
   */
  public getRelatives(sectorIx: number, fieldIx: number): Relatives {
    // Get the SmartField
    const smartField = this.smartBoard.getSmartSector(sectorIx).fields[fieldIx];

    // Function to map the field to a Relative object
    const extractRelative = (field: SmartField): Relative => ({
      fieldIx: field.index,
      sectorIx: field.sector.index,
    });

    return {
      sameHorizontal: smartField.sameHorizontal.map(extractRelative),
      sameSector: smartField.sameSector.map(extractRelative),
      sameVertical: smartField.sameVertical.map(extractRelative),
    }
  }

  /**
   * Method to create a Solution object
   *
   * @private
   * @returns {Solution}
   * @memberof Sudoku
   */
  private createSolution(): Solution {
    // Create SmartBoard with the solution
    const smartBoard = createWinnerBoard(this.winnerBoard);

    return {
      // Create the board for the game with the hidden fields
      gameBoard: this.hideFields(smartBoard.board),
      // Create a function to get a solution if the game goes hard
      getSolution: (): Board => {
        this.currentStatus = 'loose';
        
        return smartBoard.board;
      },
    }
  }

  /**
   * Method to hide fields randomly in a board
   *
   * @private
   * @param {Board} values
   * @returns {Board}
   * @memberof Sudoku
   */
  private hideFields(values: Board): Board {
    // How many fileds will be hidden according to level
    const hidden = {
      easy: randomBetween(32, 39),
      hard: randomBetween(48, 53),
      master: randomBetween(54, 55),
      medium: randomBetween(40, 47),
    }

    // Divide in a regular amount of hiden fields on each sector
    const hideFields = scatter(hidden[this.level]);

    // Hide the values
    return values.map((sector, sectorIx) => {
      // Create new sector with the already gived values
      const workingSector = [...sector];
      // Store the already taken random positions to avoid repeat it
      const taken: number[] = [];
      // Amount of hide to left
      let left = hideFields[sectorIx];

      while (left > 0) {
        // 'till the hide amount is zero hide positions
        const position = randomBetween(0, 8, taken);

        // Set zero in the position
        workingSector[position] = 0;

        left -= 1;
      }

      return workingSector;
    });
  }
}
