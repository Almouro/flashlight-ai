import { z } from "zod";

const infoSchema = z.object({
  description: z
    .string()
    // .min(10)
    .describe("The description of the action you're doing"),
  explanation: z
    .string()
    // .min(10)
    .describe("Explanation of why you are actually doing this action"),
  previousActionAnalysis: z
    .string()
    // .min(10)
    .describe(
      "What did the previous action change? What happened on the screen?"
    ),
});

const tapActionSchema = z.object({
  x: z.number().describe("The x coordinate of the tap"),
  y: z.number().describe("The y coordinate of the tap"),
});

const swipeActionSchema = z.object({
  x1: z.number().describe("The x coordinate of the first tap"),
  y1: z.number().describe("The y coordinate of the first tap"),
  x2: z.number().describe("The x coordinate of the second tap"),
  y2: z.number().describe("The y coordinate of the second tap"),
  duration: z.number().describe("The duration of the swipe in milliseconds"),
});

const typeTextActionSchema = z.object({
  text: z.string().describe("The text to type"),
});

const inputSchema = z.object({
  actionIndex: z.number(),
  info: infoSchema,
  action: z.union([
    z.object({ type: z.literal("tap"), data: tapActionSchema }),
    z.object({ type: z.literal("swipe"), data: swipeActionSchema }),
    z.object({ type: z.literal("text"), data: typeTextActionSchema }),
  ]),
});

const outputSchema = z.object({
  hierarchyDump: z.string(),
});

export const actionController = {
  inputSchema,
  outputSchema,
  meta: {
    name: "action",
    method: "POST",
    summary: "Perform an action on the screen",
  },
};

export type ActionType = z.infer<typeof inputSchema>;
