import { cloneBoard, randomBetween, randomSector, scatter } from "./helpers";
import SmartBoard, { SmartField } from "./SmartBoard";

export type GameLevel = 'easy' | 'hard' | 'master' | 'medium';
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

  // Current board
  private currentBoard: Board;
  // SmartBoard with the current board values
  private smartBoard: SmartBoard;

  constructor(
    private readonly level: GameLevel = 'medium',
    private readonly winnerBoard?: Board,
  ) {
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
    this.currentBoard = this.newSolution().map((sector, sectorIx) => {
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

    // Smart the current board
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
   * Method to set a value in a specific field. Returns if the value is valid
   *
   * @param {number} sectorIx
   * @param {number} fieldIx
   * @param {number} value
   * @returns {Boolean}
   * @memberof Sudoku
   */
  public setValue(sectorIx: number, fieldIx: number, value: number): Boolean {
    // Get the SmartField
    const smartField = this.smartBoard.getSmartSector(sectorIx).fields[fieldIx];
    // Set the value in the SmartField
    smartField.value = value;

    // Set the last board
    this.currentBoard = this.smartBoard.board;

    // Return the validation result
    return smartField.validate(value);
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

  private newSolution(): Board {
    // Create an smartboard to use
    const smartBoard = new SmartBoard(this.winnerBoard);

    // Fuction to try a solution
    const trySolution = (previousSeed?: number[]) => {
      // Restore all values
      smartBoard.resetValues();

      // Generate a random seed for central sector or if isn't the first try keep the same seed
      const seed = previousSeed || randomSector();
      // Set the seed in the central sector
      smartBoard.getSmartSector(4).setValues(seed);

      // Function set values with random positions
      const fill = () => {
        // This method fill the value in random position for each sector and so on
        for (let value = 1; value < 10; value += 1) {
          // For each sector, asign the current value to a random position checking if it's posible
          smartBoard.smartSectorList.forEach((smartSector) => {
            // If the sector is not the central one
            if (smartSector.index !== 4) {
              // Store the already taken positions to don't retry that position
              const taken: number[] = [];
              // Generate the first candidate position
              let candidate = randomBetween(0, 8, taken);
      
              // While the candidate position has a non zero value or if the value isn't valid generate another candidate
              while (smartSector.fields[candidate].value !== 0 || !smartSector.fields[candidate].validate(value)) {
                if (taken.length === 9) {      
                  // If all posible numbers was already taken and still don't have solution, throw this try and try from the ground
                  throw new Error('Imposible');
                }
      
                // Reset the candidate, ingnoring the already taken
                candidate = randomBetween(0, 8, taken);
                
                // Push the candidate to the already taken list
                taken.push(candidate);
              }
      
              // If the candidate position has a zero and the value can be positioned, asign the value
              smartSector.fields[candidate].value = value;
            }
          });
        }
      }

      try {
        // Do the first random positioning
        fill();
      } catch (error) {
        // If the random positioning fails, then retry with same seed and another random positions, 'till get a solution.
        trySolution(seed);
      }
    }

    // Start the positioning
    trySolution();

    // Map only the values
    const solution = smartBoard.board;

    return solution;
  }
}
