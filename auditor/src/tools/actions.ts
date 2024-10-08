import { z } from "zod";

const infoSchema = z.object({
  shortTitle: z
    .string()
    .describe(
      "A short title quickly describing the action taken (e.g. tap on 'CLICK ME'), starting with a verb"
    ),
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

export const tapAction = {
  type: "tap",
  description: `Tap on views. Only tap on views marked as clickable="true". Tap in the center of the bounds.`,
  inputSchema: z.object({
    info: infoSchema,
    parameters: tapActionSchema,
  }),
} as const;

export const swipeAction = {
  type: "swipe",
  description: `Swipe on a view marked as scrollable
  - to scroll down, use the swipe action from 80% of the view height to 20% of the view
  - to scroll up use the swipe action from 20% of the view height to 80% of the view`,
  inputSchema: z.object({
    info: infoSchema,
    parameters: swipeActionSchema,
  }),
} as const;

export const typeTextAction = {
  type: "type_text",
  description:
    "Type text into EditText. Keyboard must be shown first, if not shown tap on the EditText to open it.",
  inputSchema: z.object({
    info: infoSchema,
    parameters: typeTextActionSchema,
  }),
} as const;

export const backAction = {
  type: "back",
  description: "Press the back button",
  inputSchema: z.object({
    info: infoSchema,
    parameters: z.object({}),
  }),
} as const;

export const pressEnterAction = {
  type: "submit",
  description:
    "represents pressing the Enter key on the device's keyboard. This action is commonly used to submit input, confirm dialog boxes, or move to the next field in forms.",
  inputSchema: z.object({
    info: infoSchema,
    parameters: z.object({}),
  }),
} as const;

export const stopAction = {
  type: "stop",
  description: "When you've completed the task that was asked of you, stop.",
  inputSchema: z.object({
    info: infoSchema,
    parameters: z.object({}),
  }),
};

const stopSchema = z.object({
  type: z.literal("stop"),
  data: stopAction.inputSchema,
});
export type StopType = z.infer<typeof stopSchema>;

export const actionTools = [
  tapAction,
  swipeAction,
  typeTextAction,
  // backAction,
  pressEnterAction,
  stopAction,
];
// export const actionTools = [tapAction];

export const actionSchema = z.union([
  z.object({ type: z.literal(tapAction.type), data: tapAction.inputSchema }),
  z.object({
    type: z.literal(swipeAction.type),
    data: swipeAction.inputSchema,
  }),
  z.object({
    type: z.literal(typeTextAction.type),
    data: typeTextAction.inputSchema,
  }),
  z.object({
    type: z.literal(backAction.type),
    data: backAction.inputSchema,
  }),
  z.object({
    type: z.literal(pressEnterAction.type),
    data: pressEnterAction.inputSchema,
  }),
]);

export type ActionType = z.infer<typeof actionSchema>;
