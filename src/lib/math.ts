/**
 * Math utility functions for plant generation
 */

/**
 * Creates an array of numbers in a range (similar to Python's range)
 * @param start - Start value (or end if only one argument)
 * @param end - End value (exclusive)
 * @param step - Step size (default: 1)
 * @returns Array of numbers from start to end
 */
export const range = (
  start: number,
  end?: number,
  step: number = 1
): number[] => {
  const output: number[] = [];
  if (typeof end === "undefined") {
    end = start;
    start = 0;
  }
  for (let i = start; i < end; i += step) {
    output.push(i);
  }
  return output;
};

/**
 * Clamps a number between min and max values
 * @param num - Number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Clamps a number between 0 and 1
 * @param num - Number to saturate
 * @returns Value clamped to [0, 1]
 */
export function saturate(num: number): number {
  return clamp(num, 0, 1);
}

/**
 * Maps a value from one range to another
 * @param value - Input value
 * @param low1 - Input range minimum
 * @param high1 - Input range maximum
 * @param low2 - Output range minimum
 * @param high2 - Output range maximum
 * @returns Remapped value
 */
export function mapRange(
  value: number,
  low1: number,
  high1: number,
  low2: number,
  high2: number
): number {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

/**
 * Simple XOR-based hash function for strings
 * @param input - String to hash
 * @returns Normalized hash value between 0 and 1
 */
export function xorHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash ^= char;
    hash *= 0x100000001b3; // A prime number multiplier for better distribution
  }
  // Normalize the hash to be between 0 and 1
  return (hash % 1000000) / 1000000; // Adjust the modulo to desired precision
}

/**
 * Deterministic pseudo-random number generator from integer
 * @param n - Input number (seed)
 * @returns Pseudo-random value between -1 and 1
 */
export function pseudoRandom(n: number): number {
  // Convert the number to a string for hashing
  const str = n.toString();
  // Get the hash value using xorHash
  return xorHash(str) * 2 - 1;
}

/**
 * Exponential ease-in function
 * @param x - Input value (0 to 1)
 * @returns Eased value
 */
export function easeInExpo(x: number): number {
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}

/**
 * Linear interpolation between two values
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation factor (0 to 1)
 * @returns Interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Cubic ease-out function
 * @param x - Input value (0 to 1)
 * @returns Eased value
 */
export function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

/**
 * Cubic ease-in-out function
 * @param x - Input value (0 to 1)
 * @returns Eased value
 */
export function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Back ease-out function (slight overshoot past 1)
 * @param x - Input value (0 to 1)
 * @returns Eased value
 */
export function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
