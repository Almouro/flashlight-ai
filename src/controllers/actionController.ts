import { z } from "zod";
import * as kleur from "kleur";
import slugify from "slugify";
import { androidDriver } from "../AndroidDriver";
import { Controller } from "./controller";

const infoSchema = z.object({
  description: z
    .string()
    .min(10)
    .describe("The description of the action you're doing"),
  explanation: z
    .string()
    .min(10)
    .describe("Explanation of why you are actually doing this action"),
  previousActionAnalysis: z
    .string()
    .min(10)
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

const controller = async (
  body: z.infer<typeof inputSchema>
): Promise<z.infer<typeof outputSchema>> => {
  const slug = slugify(
    body.info.description.replace(/\(/g, "-").replace(/\)/g, "-")
  );
  const actionSlug = `${new Date().getTime()}`;

  console.log(kleur.cyan(`🤔 ${body.info.previousActionAnalysis}`));
  console.log(kleur.yellow(`🪄 ${body.info.description}`));
  console.log(kleur.cyan(`${body.info.explanation}`));
  console.log("   ");

  switch (body.action.type) {
    case "tap":
      const { x, y } = body.action.data;
      await androidDriver.tap({ x, y, slug, actionSlug });
      break;
    case "swipe":
      const { x1, y1, x2, y2, duration } = body.action.data;
      await androidDriver.swipe({
        x1,
        y1,
        x2,
        y2,
        duration,
        slug,
        actionSlug,
      });
      break;
    case "text":
      const { text } = body.action.data;
      await androidDriver.type({ text });
      break;
  }

  return {
    // assistantNotice: '',
    ...(await androidDriver.snapshot()),
  };
};

export const actionController: Controller<
  typeof inputSchema,
  typeof outputSchema
> = {
  inputSchema,
  outputSchema,
  controller,
  meta: {
    name: "action",
    method: "POST",
    summary: "Perform an action on the screen",
  },
};
