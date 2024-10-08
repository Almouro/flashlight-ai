import kleur from "kleur";
import {
  Explorer,
  Diagnostician,
  PlatformDriver,
  Results,
  Step,
} from "./interfaces";
import { ActionType } from "./controllers/actionController";
import { MasterDiagnostician } from "./diagnosticians/MasterDiagnostician";
import slugify from "slugify";
import { StopType } from "./controllers/stopController";
import { writeToFile } from "./utils/writeToFile";
import { Logger } from "@perf-profiler/logger";

export class Orchestrator {
  constructor(
    private driver: PlatformDriver,
    private explorer: Explorer,
    private diagnosticians: Diagnostician[]
  ) {
    this.logWelcomeMessage();
  }

  async run() {
    const steps: Step[] = [];
    const results: Results = {
      steps,
    };

    const diagnostician = new MasterDiagnostician(this.diagnosticians);

    diagnostician.startSession();

    while (true) {
      console.log("🔎 Analyzing screen...");
      const { hierarchyDump } = await this.driver.snapshot();
      const action = await this.explorer.getNextAction(hierarchyDump);

      // TODO could implement this better
      const isStop = "reason" in action;

      if (isStop) {
        this.logFinishingSession(action);
        break;
      }

      const slug = slugify(
        action.info.description.replace(/\(/g, "-").replace(/\)/g, "-")
      );
      const actionSlug = `${new Date().getTime()}`;

      this.logAction(action);

      await diagnostician.startActionDiagnostic();
      this.driver.performAction(action);
      const diagnostics = await diagnostician.endActionDiagnostic();

      steps.push({
        action: action,
        diagnostics,
      });
    }

    diagnostician.endSession();

    const actionsFilePath = writeToFile("result.json", results);
    Logger.info(`📝 Actions written to ${actionsFilePath}`);
  }

  private logFinishingSession(stop: StopType) {
    console.log(kleur.green(`✅ Finishing the session... ${stop.reason}`));
  }

  private logWelcomeMessage() {
    console.log("====================================");
    console.log("== 🤖 Welcome to Flashlight AI 🔦 ==");
    console.log("====================================");
    console.log("   ");
  }

  private logAction(action: ActionType) {
    console.log(kleur.cyan(`🤔 ${action.info.previousActionAnalysis}`));
    console.log(kleur.yellow(`🪄 ${action.info.description}`));
    console.log(kleur.cyan(`${action.info.explanation}`));
    console.log("   ");
  }
}
