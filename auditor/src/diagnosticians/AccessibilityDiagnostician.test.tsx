import { AccessibilityDiagnostician } from "./AccessibilityDiagnostician";
import { Step } from "../interfaces";
import fs from "fs";

const realLifeExample = fs.readFileSync(
  `${__dirname}/realExample.xml`,
  "utf-8"
);

const validHierarchy = `
<hierarchy>
  <node index="0" text="Submit" clickable="true" content-desc="Submit button" />
</hierarchy>
`;

const missingContentDesc = `
<hierarchy>
  <node index="0" text="" clickable="true" bounds="[0,1041][1080,1129]" />
</hierarchy>
`;

const emptyTextNode = `
<hierarchy>
  <node index="0" text="" clickable="true" content-desc="Clickable but empty" />
</hierarchy>
`;

const missingBounds = `
<hierarchy>
  <node index="0" text="No bounds" clickable="true" content-desc="No bounds element" />
</hierarchy>
`;

const createMockStep = (xmlDump: string): Step => ({
  hierarchyDumpBeforeAction: xmlDump,
  timingsMs: { stepBegin: 0, stepEnd: 0 },
  dataCollected: [],
  action: {
    type: "tap",
    data: {
      info: {
        shortTitle: "Mock action",
        description: "Mock action",
        explanation: "Mock explanation",
        previousActionAnalysis: "Mock analysis",
      },
      parameters: { x: 0, y: 0 },
    },
  },
});

describe("AccessibilityDiagnostician", () => {
  let diagnostician: AccessibilityDiagnostician;

  beforeEach(() => {
    diagnostician = new AccessibilityDiagnostician();
  });

  test("should work on a real life example", async () => {
    const step = createMockStep(realLifeExample);
    const { issues } = diagnostician.diagnoseStep(step);
    expect(issues.map((issue) => issue.description)).toEqual([]);
  });

  test("should not find any issues in a valid hierarchy", async () => {
    const step = createMockStep(validHierarchy);
    const { issues } = diagnostician.diagnoseStep(step);
    expect(issues.map((issue) => issue.description)).toEqual([]);
  });

  test("should detect missing content description on clickable element", async () => {
    const step = createMockStep(missingContentDesc);
    const { issues } = diagnostician.diagnoseStep(step);
    expect(issues.map((issue) => issue.description)).toMatchInlineSnapshot(`
[
  "Clickable element at bounds: [0,1041][1080,1129] is missing a content description or text.",
]
`);
  });

  test.skip("should detect empty text in a clickable element", async () => {
    const step = createMockStep(emptyTextNode);
    const { issues } = diagnostician.diagnoseStep(step);
    expect(issues.map((issue) => issue.description)).toEqual([
      "Element at node[0] has empty text.",
    ]);
  });

  test("should handle missing bounds gracefully", async () => {
    const step = createMockStep(missingBounds);
    const { issues } = diagnostician.diagnoseStep(step);
    expect(issues.map((issue) => issue.description)).toEqual([]);
  });
});
