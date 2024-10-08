import { z } from "zod";
import { Controller } from "./controller";
import { AndroidDriver } from "../platforms/AndroidDriver";

const inputSchema = z.object({});
const outputSchema = z.object({
  hierarchyDump: z.string(),
});

// TODO: get rid of this
const controller = async () => {
  return new AndroidDriver().snapshot();
};

export const snapshotController: Controller<
  typeof inputSchema,
  typeof outputSchema
> = {
  inputSchema,
  outputSchema,
  controller,
  meta: {
    method: "GET",
    name: "snapshot",
    summary: "Get hierarchy dump of the xml tree",
  },
};
