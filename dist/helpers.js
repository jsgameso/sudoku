"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneBoard = (board) => {
    return [...board.map((r) => [...r])];
};
exports.randomBetween = (min, max, ignore) => {
    let random = Math.floor(Math.random() * (max - min + 1) + min);
    if (typeof ignore === 'undefined') {
        return random;
    }
    else if (typeof ignore === 'number') {
        while (random === ignore) {
            random = Math.floor(Math.random() * (max - min + 1) + min);
        }
        return random;
    }
    else if (ignore instanceof Array) {
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
exports.randomSector = () => {
    const result = [];
    while (result.length < 9) {
        let random = exports.randomBetween(1, 9, result);
        result.push(random);
    }
    return result;
};
exports.scatter = (threshold) => {
    let left = threshold;
    const result = [];
    const min = Math.floor(threshold / 9) - 1;
    const max = Math.ceil(threshold / 9) + 1;
    while (left > 0) {
        const toPush = exports.randomBetween(min, max);
        result.push(toPush);
        left -= toPush;
    }
    const leftPositions = 9 - result.length;
    if (leftPositions > 0) {
        result.push(...Array(leftPositions).fill([]));
    }
    else {
        for (let index = 0; index < Math.abs(leftPositions); index += 1) {
            left += result.pop();
        }
    }
    if (left < 0) {
        while (left !== 0) {
            if (result[exports.randomBetween(0, 8)] > 0) {
                result[exports.randomBetween(0, 8)] -= 1;
            }
            left += 1;
        }
    }
    else if (left > 0) {
        while (left !== 0) {
            result[exports.randomBetween(0, 8)] += 1;
            left -= 1;
        }
    }
    return result;
};
//# sourceMappingURL=helpers.js.map