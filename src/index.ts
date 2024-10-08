import { Logger, LogLevel } from "@perf-profiler/logger";

Logger.setLogLevel(LogLevel.DEBUG);

import { program } from "commander";
import { Orchestrator } from "./orchestrator";
import { Diagnostician, Explorer } from "./interfaces";
import { OpenAIExplorer } from "./explorers/ai/OpenAIExplorer";
import { AndroidDriver } from "./platforms/AndroidDriver";
import { PerformanceDiagnostician } from "./diagnosticians/PerformanceDiagnostician";
import { MockExplorer } from "./explorers/mock/MockExplorer";

program.command("run").action(async () => {
  const driver = new AndroidDriver();
  // const explorer: Explorer = new OpenAIExplorer();
  const explorer: Explorer = new MockExplorer();
  const diagnosticians: Diagnostician[] = [new PerformanceDiagnostician()];

  new Orchestrator(driver, explorer, diagnosticians).run();
});

program.parse(process.argv);
