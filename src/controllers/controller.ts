import { z } from "zod";

export type Controller<
  Input extends z.ZodObject<any, any, any>,
  Output extends z.ZodObject<any, any, any>
> = {
  inputSchema: Input;
  outputSchema: Output;
  controller: (body: z.infer<Input>) => Promise<z.infer<Output>>;
  meta: {
    name: string;
    method: "GET" | "POST";
    summary: string;
  };
};
