import { parseBounds } from "./parseBounds";
import { Bounds } from "../interfaces";

describe("parseBounds", () => {
  it("should parse bounds correctly for [16,1057][1064,1114]", () => {
    const boundsString = "[16,1057][1064,1114]";
    const expectedBounds: Bounds = {
      top: 1057,
      left: 16,
      right: 1064,
      bottom: 1114,
    };

    const result = parseBounds(boundsString);

    expect(result).toEqual(expectedBounds);
  });
});
