import { execSync } from "child_process";
import { Logger } from "@perf-profiler/logger";

export const executeCommand = (command: string) => {
  Logger.debug(`> ${command}`);
  return execSync(command).toString();
};
