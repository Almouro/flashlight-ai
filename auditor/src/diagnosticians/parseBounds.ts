import { Bounds } from "../interfaces";

export const parseBounds = (bounds: string): Bounds => {
  const match = bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
  if (!match) {
    throw new Error("Invalid bounds format");
  }
  const [, left, top, right, bottom] = match;

  return {
    top: parseInt(top),
    left: parseInt(left),
    right: parseInt(right),
    bottom: parseInt(bottom),
  };
};
