import { z } from "zod";
import * as kleur from "kleur";
import { Controller } from "./controller";

const inputSchema = z.object({
  reason: z.string().describe("The reason why you are stopping the session"),
});
const outputSchema = z.object({});

export const stopController: Controller<
  typeof inputSchema,
  typeof outputSchema
> = {
  inputSchema,
  outputSchema: z.object({}),
  controller: async ({ reason }: StopType) => {
    console.log(kleur.green(`✅ Finishing the session... ${reason}`));
    return {};
  },
  meta: {
    name: "stop",
    method: "POST",
    summary: "Stop the session",
  },
};

export type StopType = z.infer<typeof inputSchema>;
