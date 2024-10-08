#!/usr/bin/env -S npm run tsn -T

import OpenAI from "openai";
import fs from "fs";
import { snapshotController } from "../../controllers/snapshotController";
import {
  actionController,
  ActionType,
} from "../../controllers/actionController";
import { EventEmitter } from "events";
import { zodFunction } from "./zodToOpenAITool";
import { Logger } from "@perf-profiler/logger";
import { ChatCompletionRunner } from "openai/resources/beta/chat/completions";
import { z } from "zod";
import { Explorer } from "../../interfaces";
import { stopController, StopType } from "../../controllers/stopController";

const client = new OpenAI();

const prompt = fs.readFileSync("./GPT.md", "utf-8");

const logVariable = (name: string, variable: object) => {
  Logger.trace(`${name}: ${JSON.stringify(variable, null, 2)}`);
};

class ActionEventEmitter {
  private eventEmitter = new EventEmitter();
  private static ACTION_DONE = "ACTION_DONE";
  private static STOP = "STOP";
  private static ACTION = "ACTION";

  emitAction(action: ActionType) {
    this.eventEmitter.emit(ActionEventEmitter.ACTION, action);
  }

  emitStop(stop: StopType) {
    this.eventEmitter.emit(ActionEventEmitter.STOP, stop);
  }

  emitActionDone(action: { hierarchyDump: string }) {
    this.eventEmitter.emit(ActionEventEmitter.ACTION_DONE, action);
  }

  waitForActionDone() {
    return new Promise<z.infer<typeof actionController.outputSchema>>(
      (resolve) => {
        this.eventEmitter.once(ActionEventEmitter.ACTION_DONE, resolve);
      }
    );
  }

  waitForNextActionOrStop() {
    return new Promise<ActionType | StopType>((resolve) => {
      this.eventEmitter.once(ActionEventEmitter.ACTION, resolve);
      this.eventEmitter.once(ActionEventEmitter.STOP, resolve);
    });
  }
}

export class OpenAIExplorer implements Explorer {
  private eventEmitter = new ActionEventEmitter();
  private runner: ChatCompletionRunner<null> = this.createRunner();

  /**
   * This is a bit weird
   *
   * Essentially, what we want to do is interrupt the OpenAI runner so
   * that we can do whatever we want
   */
  private async runAction(
    action: z.infer<typeof actionController.inputSchema>
  ): Promise<z.infer<typeof actionController.outputSchema>> {
    this.eventEmitter.emitAction(action);
    return this.eventEmitter.waitForActionDone();
  }

  private async runStop(body: StopType) {
    this.eventEmitter.emitStop(body);
  }

  async getNextAction(hierarchyDump: string): Promise<ActionType | StopType> {
    this.eventEmitter.emitActionDone({
      hierarchyDump,
    });
    return this.eventEmitter.waitForNextActionOrStop();
  }

  private createRunner(): ChatCompletionRunner<null> {
    return client.beta.chat.completions
      .runTools({
        model: "gpt-4o-mini",
        stream: false,
        tools: [
          zodFunction({
            function: this.runAction.bind(this),
            schema: actionController.inputSchema,
            description: actionController.meta.summary,
            name: actionController.meta.name,
          }),
          zodFunction({
            function: snapshotController.controller,
            schema: snapshotController.inputSchema,
            description: snapshotController.meta.summary,
            name: snapshotController.meta.name,
          }),
          zodFunction({
            function: this.runStop.bind(this),
            schema: stopController.inputSchema,
            description: stopController.meta.summary,
            name: stopController.meta.name,
          }),
        ],
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: `Explore the current app`,
          },
        ],
      })
      .on("message", (msg) => Logger.trace(`msg: ${msg}`))
      .on("functionCall", async (functionCall) => {
        logVariable("functionCall", functionCall);
      })
      .on("functionCallResult", (functionCallResult) =>
        logVariable("functionCallResult", JSON.parse(functionCallResult))
      )
      .on("content", (diff) => process.stdout.write(diff))
      .on("end", () =>
        this.eventEmitter.emitStop({
          reason: "❌ OpenAI agent has decided to stop ❌",
        })
      );
  }
}
