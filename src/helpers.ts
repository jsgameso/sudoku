import { Board } from "./Sudoku";

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
