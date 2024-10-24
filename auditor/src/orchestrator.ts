import kleur from "kleur";
import {
  Explorer,
  DataCollector,
  PlatformDriver,
  Results,
  StepInput,
} from "./interfaces";
import { MasterDataCollector } from "./collectors/MasterDataCollector";
import { writeToFile } from "./utils/writeToFile";
import { Logger } from "@perf-profiler/logger";
import { ActionType, StopType } from "./tools/actions";

class Timer {
  static getCurrentTimestamp() {
    return performance.now();
  }
}

export class Orchestrator {
  constructor(
    private driver: PlatformDriver,
    private explorer: Explorer,
    private dataCollectors: DataCollector[]
  ) {
    this.logWelcomeMessage();
  }

  private recorder = this.driver.getScreenRecorder(`video.mp4`);

  async stop() {
    console.log("✅ Finishing the session...");
    await this.recorder.stopRecording();
    await this.recorder.pullRecording(
      `${process.cwd()}/webapp/public/video.mp4`
    );
  }

  async run() {
    const results = new Results();
    await this.recorder.startRecording({});

    const collector = new MasterDataCollector(this.dataCollectors);

    let stepCount = 0;

    while (true) {
      console.log("🔎 Analyzing screen...");

      const stepInput = await this.collectStepInput();
      const action = await this.explorer.getNextAction(stepInput);
      this.logAction(action);

      stepCount++;
      if (stepCount > 20) {
        console.log("Reached max step count (20).");
        break;
      }

      if (action.type === "stop") break;

      const stepBeginTimestamp = Timer.getCurrentTimestamp();
      await collector.startDataCollection();
      await this.driver.performAction(action);
      const dataCollected = await collector.endDataCollection();
      const stepEndTimestamp = Timer.getCurrentTimestamp();

      results.steps.push({
        action: action,
        dataCollected,
        timingsMs: {
          stepBegin: stepBeginTimestamp - this.recorder.getRecordingStartTime(),
          stepEnd: stepEndTimestamp - this.recorder.getRecordingStartTime(),
        },
        hierarchyDumpBeforeAction: stepInput.hierarchyDump,
      });

      this.saveResults(results);
    }

    await this.stop();
  }

  private currentHierarchyDump: string | null = null;

  private async collectStepInput(): Promise<StepInput> {
    const start = performance.now();
    const { hierarchyDump } = await this.driver.snapshot();
    const end = performance.now();
    Logger.debug(`Took ${end - start}ms to get the hierarchy dump`);

    const keyboardShown = await this.driver.isKeyboardShown();
    const previousHierarchyDump = this.currentHierarchyDump;
    this.currentHierarchyDump = hierarchyDump;

    return {
      hierarchyDump,
      keyboardShown,
      previousHierarchyDump,
    };
  }

  private saveResults(results: Results) {
    writeToFile(
      `${process.cwd()}/webapp/app/components/results.json`,
      results.toJSON()
    );
  }

  private logWelcomeMessage() {
    console.log("====================================");
    console.log("== 🤖 Welcome to Flashlight AI 🔦 ==");
    console.log("====================================");
    console.log("   ");
  }

  private logAction(action: ActionType | StopType) {
    console.log(kleur.cyan(`🤔 ${action.data.info.previousActionAnalysis}`));
    console.log(kleur.yellow(`🪄 ${action.data.info.description}`));
    console.log(kleur.cyan(`${action.data.info.explanation}`));
    console.log("   ");
  }
}
