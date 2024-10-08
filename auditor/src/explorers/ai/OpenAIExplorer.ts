import fs from "fs";
import { Explorer, StepInput } from "../../interfaces";
import OpenAI from "openai";
import zodToJsonSchema from "zod-to-json-schema";
import {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "openai/resources";
import {
  actionSchema,
  actionTools,
  ActionType,
  pressEnterAction,
  stopAction,
  StopType,
  swipeAction,
  tapAction,
  typeTextAction,
} from "../../tools/actions";
import { promptUser } from "../../utils/prompt";
import { z } from "zod";

const client = new OpenAI();
const prompt = fs.readFileSync("./auditor/GPT2.md", "utf-8");

export class OpenAIExplorer implements Explorer {
  static DEFAULT_MODEL = "gpt-4o-mini";

  messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: prompt,
    },
  ];
  actions: string[] = [];
  previousInput: StepInput | null = null;

  constructor(private customPrompt?: string) {}

  getNextAction(input: StepInput): Promise<ActionType | StopType> {
    return this.makeNextCall(input);
  }

  private createUserMessage(stepInput: StepInput): ChatCompletionMessageParam {
    const sameHierarchy =
      this.previousInput?.hierarchyDump === stepInput.hierarchyDump;

    const goal = this.customPrompt
      ? `Your goal is to fulfill all those actions in this order: "${this.customPrompt}".`
      : // Ensure you test every interactive element available, including buttons, links, and scrollable views.
        // Only stop once you've comprehensively explored and reported on all functionalities, and confirm that no elements are left untested.`
        `Continue exploring the current app`;

    const content = `${goal}. ${
      sameHierarchy ? "The previous action didn't change the screen. " : ""
    }. This is the current hierarchy: ${
      stepInput.hierarchyDump
    }. The keyboard is ${stepInput.keyboardShown ? "shown" : "hidden"} 
1. establish a summary of the actions taken so far
2. describe the screen you're on
3. confirm which of the goals have been achieved and which goals are left
4. if all the goals have been achieved in the order that was given. If so use the stop tool
otherwise, choose the best action to accomplish them`;
    // 3. otherwise, determine which actions are still available
    // 4. eliminate the actions similar to actions already been taken
    // 5. choose the best action to continue the exploration`;

    // choose the best action and behave like a user wanting to explore all the app's features
    // RULE: you can only call one tool`;
    // First analyze all the tool calls you can make.
    // Then check the previous messages to eliminate the actions you have already taken.
    // Finally, choose the best action to continue your exploration.`;

    this.previousInput = stepInput;

    return {
      role: "user",
      content,
    };
  }

  async confirmStop() {
    const prompt = `I'm a QA engineer who has been exploring the app.
My goal was to complete all of those in order: ${this.customPrompt}
Count the number of goals I needed to do.

I have taken the following actions:
- ${this.actions.join("\n-")}

Check which goal I have achieved and which goals are left.
Verify that I have completed all the goals in the order given.`;

    const inputSchema = z.object({
      completed: z.boolean().describe("Whether the task is completed"),
      assessment: z
        .string()
        .describe(
          "The assessment of the task and what I need to do to complete it"
        ),
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
      tools: [
        {
          type: "function",
          function: {
            name: "assess",
            description: "Assess if I've finished my task",
            parameters: zodToJsonSchema(inputSchema),
          },
        },
      ],
      tool_choice: "required",
    });
    const message = response.choices[0]?.message;
    const toolCall = message.tool_calls?.[0];
    const functionCall = toolCall?.function;

    if (!functionCall) {
      throw new Error("function call not found");
    }

    const parameters = inputSchema.parse(JSON.parse(functionCall.arguments));

    return parameters;
  }

  async chat(prompt: string): Promise<string | null> {
    this.messages.push({
      role: "user",
      content: prompt,
    });
    const response = await client.chat.completions.create({
      model: OpenAIExplorer.DEFAULT_MODEL,
      messages: this.messages,
      stream: false,
    });

    const answer = response.choices[0].message;
    this.messages.push(answer);

    return response.choices[0].message.content;
  }

  private async enterDialog() {
    let userInput;
    while ((userInput = await promptUser("What do you want to say?"))) {
      console.log(await this.chat(userInput));
    }
  }

  private async makeNextCall(stepInput: StepInput): Promise<ActionType> {
    this.messages.push(this.createUserMessage(stepInput));

    const tools = stepInput.keyboardShown
      ? [typeTextAction, pressEnterAction]
      : [tapAction, swipeAction, stopAction];

    const response = await client.chat.completions.create({
      model: OpenAIExplorer.DEFAULT_MODEL,
      messages: this.messages,
      // messages: [...this.messages, this.createUserMessage(stepInput)],
      stream: false,
      tools: tools.map((tool) => ({
        type: "function",
        function: {
          name: tool.type,
          description: tool.description,
          parameters: zodToJsonSchema(tool.inputSchema),
        },
      })),
      // tools: [
      //   {
      //     type: "function",
      //     function: {
      //       name: "action",
      //       description: "Perform an action on the screen",
      //       parameters: zodToJsonSchema(singleActionSchema),
      //     },
      //   },
      // ],
      tool_choice: "required",
      // tool_choice: {
      //   type: "function",
      //   function: {
      //     name: "action",
      //   },
      // }, // Force the assistant to call a tool
    });

    const message = response.choices[0]?.message;
    const toolCall = message.tool_calls?.[0];
    const functionCall = toolCall?.function;

    if (functionCall) {
      const tool = actionTools.find((tool) => tool.type === functionCall.name);

      try {
        if (!tool) {
          throw new Error(`Unknown tool: ${functionCall.name}`);
        }

        const parameters = tool.inputSchema.parse(
          JSON.parse(functionCall.arguments)
        );

        this.messages.push({
          ...message,
          tool_calls: [toolCall],
        });

        if (tool.type === "stop") {
          const assessment = await this.confirmStop();

          if (!assessment.completed) {
            this.messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                success: false,
                error: `The task is not completed. ${assessment.assessment}`,
              }),
            });
            return this.makeNextCall(stepInput);
          }
        }

        this.actions.push(parameters.info.description);
        this.messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            success: true,
          }),
        });

        return {
          // @ts-expect-error
          type: tool.type,
          data: parameters,
        };
      } catch (error) {
        console.error(
          "ERROR Parsing action",
          functionCall.name,
          functionCall.arguments,
          error
        );

        if (!(error instanceof Error)) throw error;

        this.messages.push({
          ...message,
          tool_calls: [toolCall],
        });
        this.messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            success: false,
            error: error.message,
          }),
        });
        return this.makeNextCall(stepInput);
      }
    }

    // TODO: add a message to the client telling them it's wrong
    throw new Error("Unknown function call");
  }
}
