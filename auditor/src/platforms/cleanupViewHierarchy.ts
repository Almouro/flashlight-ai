import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { parseBounds } from "../diagnosticians/parseBounds";

type ViewNode = {
  id: string;
  type: string;
  children: ViewNode[];

  text?: string;
  contentDesc?: string;
  clickable: boolean;
  scrollable: boolean;
  bounds: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
};

const cleanupNode = (node: any): ViewNode => {
  const result: ViewNode = {
    id: node.id,
    type: node.class,
    children: Array.isArray(node.node)
      ? node.node.map(cleanupNode)
      : node.node
      ? [cleanupNode(node.node)]
      : [],
    bounds: parseBounds(node.bounds),
    scrollable: node.scrollable === "true",
    clickable: node.clickable === "true" && node.enabled === "true",
  };

  if (node.text) result.text = node.text;
  if (node["content-desc"]) result.contentDesc = node["content-desc"];

  // if result has only one children and it's identical, return the child instead
  if (result.children.length === 1) {
    const child = result.children[0];

    if (
      JSON.stringify({ ...child, children: undefined }) ===
      JSON.stringify({ ...result, children: undefined })
    ) {
      return child;
    }
  }

  return result;
};

const formatToXml = (node: ViewNode): object => {
  const result = {
    ...node,
    children: undefined,
    bounds: `left:${node.bounds.left},top:${node.bounds.top},right:${node.bounds.right},bottom:${node.bounds.bottom}`,
    // bounds: `[${node.bounds.left},${node.bounds.top}][${node.bounds.right},${node.bounds.bottom}]`,
    node: node.children.map(formatToXml),
  };

  return result;
};

export const cleanupViewHierarchy = (
  hierarchyDump: string,
  prettify = true
): string => {
  const parser = new XMLParser({
    ignoreAttributes: false, // We need attributes
    attributeNamePrefix: "", // Avoid prefixes on attributes
  });

  const result = parser.parse(hierarchyDump);

  const parsedHierarchy = cleanupNode(result.hierarchy.node);

  const builder = new XMLBuilder({
    format: prettify,
    ignoreAttributes: false, // We need attributes
    attributeNamePrefix: "", // Avoid prefixes on attributes
    suppressBooleanAttributes: false,
  });
  // return builder.build(result);
  return builder
    .build({
      "?xml": { version: "1.0", encoding: "UTF-8", standalone: "yes" },
      hierarchy: {
        node: formatToXml(parsedHierarchy),
      },
    })
    .replace("Navigate up", "Back to previous screen");
};
