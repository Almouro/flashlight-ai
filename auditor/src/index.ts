import { Logger, LogLevel } from "@perf-profiler/logger";

Logger.setLogLevel(LogLevel.SILENT);

import { program } from "commander";
import { Orchestrator } from "./orchestrator";

import { DataCollector, Explorer } from "./interfaces";
import { AndroidDriver } from "./platforms/AndroidDriver";
import { PerformanceDataCollector } from "./collectors/PerformanceDataCollector";
import { OpenAIExplorer } from "./explorers/ai/OpenAIExplorer";
import { promptUser } from "./utils/prompt";

program
  .command("run")
  .option("--goal <goal>", "The goal of the exploration")
  .action(async ({ goal }) => {
    const driver = new AndroidDriver();
    const prompt = goal ?? (await promptUser("🤖 What is my purpose?"));
    const explorer: Explorer = new OpenAIExplorer(prompt);
    const diagnosticians: DataCollector[] = [new PerformanceDataCollector()];

    const orchestrator = new Orchestrator(driver, explorer, diagnosticians);
    orchestrator.run();
  });

program.command("hierarchy").action(async () => {
  const driver = new AndroidDriver();
  console.log((await driver.snapshot()).hierarchyDump);
});

program.parse(process.argv);
