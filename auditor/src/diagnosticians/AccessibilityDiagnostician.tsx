import { Diagnostic, Diagnostician, Issue, Step } from "../interfaces";
import { XMLParser } from "fast-xml-parser";
import { parseBounds } from "./parseBounds";

function traverse(node: any, callback: (node: any) => void) {
  callback(node);

  // Check if node has child nodes
  if (node.node) {
    // node.node can be an array or an object
    if (Array.isArray(node.node)) {
      // If it's an array, iterate over each child node
      node.node.forEach((childNode: any, index: number) => {
        traverse(childNode, callback);
      });
    } else {
      // If it's a single object, traverse it directly
      traverse(node.node, callback);
    }
  }
}

const investigateNode = (node: any) => {
  const issues: string[] = [];

  const focusable = node.focusable === "true";
  const clickable = node.clickable === "true";

  if ((clickable || focusable) && !node["content-desc"] && !node.text) {
    issues.push(
      `${clickable ? "Clickable" : "Focusable"} element at bounds: ${
        node.bounds
      } is missing a content description or text.`
    );
  }

  return issues;
};

export class AccessibilityDiagnostician implements Diagnostician {
  diagnoseStep(step: Step): Diagnostic {
    const { hierarchyDumpBeforeAction } = step;
    const issues: Issue[] = [];

    const parser = new XMLParser({
      ignoreAttributes: false, // We need attributes
      attributeNamePrefix: "", // Avoid prefixes on attributes
    });

    try {
      // Parse the XML string synchronously
      const result = parser.parse(hierarchyDumpBeforeAction);
      traverse(result.hierarchy, (node) => {
        const nodeIssues = investigateNode(node);

        if (node.bounds) {
          const bounds = parseBounds(node.bounds);

          issues.push(
            ...nodeIssues.map((description) => ({
              description,
              impactedElement: {
                bounds,
                videoTimingMs: step.timingsMs.stepBegin,
              },
            }))
          );
        }
      });
    } catch (err) {
      throw new Error(
        "Error parsing View Hierarchy XML: " +
          (err instanceof Error ? err.message : "unknown error")
      );
    }

    return { issues };
  }
}
