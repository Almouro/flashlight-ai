import { TestCaseResult } from "@perf-profiler/types";
import { ActionType } from "./controllers/actionController";
import { StopType } from "./controllers/stopController";

/**
 * This could be:
 * - an AI
 * - an e2e test (might be tricky to implement)
 * - a manual test (might be tricky to implement)
 */
export interface Explorer {
  getNextAction(hierarchyDump: string): Promise<ActionType | StopType>;
}

/**
 * This could be:
 * - performance report
 * - accessibility report
 */
export interface Diagnostician {
  startSession(): Promise<void>;
  startActionDiagnostic(): Promise<void>;
  endActionDiagnostic(): Promise<Diagnostic[]>;
  endSession(): Promise<void>;
}

export interface PlatformDriver {
  performAction(action: ActionType): Promise<void>;
  snapshot(): Promise<{ hierarchyDump: string }>;
}

export interface Diagnostic {
  issues: string[];
}

export interface PerformanceDiagnostic extends Diagnostic {
  results: TestCaseResult;
}

export type Step = {
  action: ActionType;
  diagnostics: Diagnostic[];
};

export type Results = {
  steps: Step[];
};
