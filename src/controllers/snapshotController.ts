import { z } from "zod";
import { androidDriver } from "../AndroidDriver";
import { Controller } from "./controller";

const inputSchema = z.object({});
const outputSchema = z.object({
  hierarchyDump: z.string(),
});

const controller = async () => {
  return androidDriver.snapshot();
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
