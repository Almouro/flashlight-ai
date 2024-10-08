import { ScreenRecorder, type TestCaseResult } from "@perf-profiler/types";
import { Serializable, Serializer } from "./utils/serializable";
import { ActionType, StopType } from "./tools/actions";

export type StepInput = {
  hierarchyDump: string;
  keyboardShown: boolean;
  previousHierarchyDump: string | null;
};

/**
 * This could be:
 * - an AI
 * - an e2e test (might be tricky to implement)
 * - a manual test (might be tricky to implement)
 */
export interface Explorer {
  getNextAction(info: StepInput): Promise<ActionType | StopType>;
}

/**
 * This could be:
 * - performance report
 * - accessibility report
 */
export interface DataCollector {
  startDataCollection(): Promise<void>;
  endDataCollection(): Promise<AppDataCollection[]>;
}

export interface PlatformDriver {
  performAction(action: ActionType): Promise<void>;
  snapshot(): Promise<{ hierarchyDump: string }>;
  isKeyboardShown(): Promise<boolean>;
  getScreenRecorder(file: string): ScreenRecorder;
}

export type Bounds = {
  top: number;
  left: number;
  bottom: number;
  right: number;
};
export type Diagnostic = {
  issues: Issue[];
};
export type Issue = {
  description: string;
  impactedElement?: {
    bounds: Bounds;
    videoTimingMs: number;
  };
};
export interface Diagnostician {
  diagnoseStep(step: Step): Diagnostic;
}

@Serializable
export abstract class AppDataCollection {
  constructor() {}
}

@Serializable
export class PerformanceDataCollection extends AppDataCollection {
  constructor(public results: TestCaseResult) {
    super();
  }
}

export type Step = {
  action: ActionType;
  dataCollected: AppDataCollection[];
  hierarchyDumpBeforeAction: string;
  timingsMs: {
    stepBegin: number;
    stepEnd: number;
  };
};

export class Results {
  steps: Step[] = [];

  toJSON(): object {
    return {
      ...this,
      steps: this.steps.map((step) => ({
        ...step,
        dataCollected: step.dataCollected.map((data) =>
          Serializer.toJSON(data)
        ),
      })),
    };
  }

  static fromJSON(parsed: object): Results {
    const results = new Results();
    // @ts-expect-error
    results.steps = parsed.steps.map((step: any) => ({
      ...step,
      dataCollected: step.dataCollected.map((diagnostic: { _class: string }) =>
        Serializer.fromJSON(diagnostic)
      ),
    })) as Step[];

    return results;
  }
}

export { AccessibilityDiagnostician } from "./diagnosticians/AccessibilityDiagnostician";
export { PerformanceDiagnostician } from "./diagnosticians/PerformanceDiagnostician";
