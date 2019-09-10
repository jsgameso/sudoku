import { Board } from "./Sudoku";
import { SmartBoard } from "../dist";

/**
 * Create pure clone of a board.
 *
 * @param {Board} board
 * @returns {Board}
 */
export const cloneBoard = (board: Board): Board => {
  return [...board.map((r: number[]) => [...r])];
}

/**
 * Get random number between range of min and max, (min and max also appear as result).
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const randomBetween = (min: number, max: number, ignore?: number | number[]): number => {
  let random = Math.floor(Math.random() * (max - min + 1) + min);

  if (typeof ignore === 'undefined') {
    return random;
  } else if (typeof ignore === 'number') {
    while (random === ignore) {
      random = Math.floor(Math.random() * (max - min + 1) + min);
    }

    return random;
  } else if (ignore instanceof Array) {
    if (ignore.length === 0) {
      return random;
    }

    if (ignore.some((v) => typeof v !== 'number')) {
      throw new Error('Invalid operation');
    }

    while (ignore.indexOf(random) !== -1) {
      random = Math.floor(Math.random() * (max - min + 1) + min);
    }

    return random;
  }

  throw new Error('Invalid operation');
};


/**
 * Generates a sector with random number
 *
 * @returns {number[]}
 */
export const randomSector = (): number[] => {
  // Creates the result array to store the values;
  const result: number[] = [];

  while (result.length < 9) {
    // Create a random number excluding the already taken
    let random = randomBetween(1, 9, result);

    // Push the number
    result.push(random);
  }

  // Return the result
  return result;
}

/**
 * Function to scatter an amount in 9
 *
 * @param {number} threshold
 * @returns {number[]}
 */
export const scatter = (threshold: number): number[] => {
  let left = threshold;
  const result: number[] = [];

  const min = Math.floor(threshold / 9) - 1;
  const max = Math.ceil(threshold / 9) + 1;

  while (left > 0) {
    const toPush = randomBetween(min, max);

    result.push(toPush);

    left -= toPush;
  }

  const leftPositions = 9 - result.length;

  if (leftPositions > 0) {
    result.push(...Array(leftPositions).fill([]));
  } else {
    while (result.length !== 9) {
      left += result.pop()!;
    }
  }

  if (left < 0) {
    while (left !== 0) {
      if (result[randomBetween(0, 8)] > 0) {
        result[randomBetween(0, 8)] -= 1;
      }

      left += 1;
    }
  } else if (left > 0) {
    while (left !== 0) {
      result[randomBetween(0, 8)] += 1;

      left -= 1;
    }
  }

  while (result.reduce((a, b) => a + b) !== threshold) {
    const shouldAdd = result.reduce((a, b) => a + b) < threshold;

    if (shouldAdd) {
      result[randomBetween(0, 8)] += 1;
    } else if (result[randomBetween(0, 8)] > 0) {
      result[randomBetween(0, 8)] -= 1;
    }
  }

  return result;
}

/**
 * Function to create a SmartBoard with a solution
 *
 * @param {Board} [values]
 * @returns {SmartBoard}
 */
export const createWinnerBoard = (values?: Board): SmartBoard => {
  // Create an smartboard to use
  const smartBoard = new SmartBoard(values);

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

  return smartBoard;
}
