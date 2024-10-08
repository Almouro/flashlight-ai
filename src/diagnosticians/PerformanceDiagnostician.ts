import { profiler } from "@perf-profiler/profiler";
import { Diagnostician, PerformanceDiagnostic } from "../interfaces";
import { PerformanceMeasurer } from "@perf-profiler/e2e";
import { Report } from "@perf-profiler/reporter";
import { TestCaseResult } from "@perf-profiler/types";
import { FlashlightReporter } from "./FlashlightReporter";

export class PerformanceDiagnostician implements Diagnostician {
  private performanceMeasurer: PerformanceMeasurer | null = null;

  async startSession(): Promise<void> {
    // TODO: implement
  }

  async startActionDiagnostic(): Promise<void> {
    const bundleId = profiler.detectCurrentBundleId();
    this.performanceMeasurer = new PerformanceMeasurer(bundleId, {
      recordOptions: {
        record: false,
      },
    });

    await this.performanceMeasurer.start();
  }
  async endActionDiagnostic(): Promise<PerformanceDiagnostic[]> {
    if (!this.performanceMeasurer) {
      throw new Error("PerformanceMeasurer not started");
    }

    const iteration = await this.performanceMeasurer.stop(2000);

    const result: TestCaseResult = {
      iterations: [iteration],
      name: "Action",
      status: iteration.status,
    };

    FlashlightReporter.logReport({ results: result });

    return [
      {
        issues: [],
        results: result,
      },
    ];
  }

  async endSession(): Promise<void> {
    // TODO: implement
  }
}
