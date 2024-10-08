import { profiler } from "@perf-profiler/profiler";
import { DataCollector, PerformanceDataCollection } from "../interfaces";
import { PerformanceMeasurer } from "@perf-profiler/e2e";
import { TestCaseResult } from "@perf-profiler/types";

export class PerformanceDataCollector implements DataCollector {
  private performanceMeasurer: PerformanceMeasurer | null = null;

  async startDataCollection(): Promise<void> {
    const bundleId = profiler.detectCurrentBundleId();
    this.performanceMeasurer = new PerformanceMeasurer(bundleId, {
      recordOptions: {
        record: false,
      },
    });

    await this.performanceMeasurer.start();
  }
  async endDataCollection(): Promise<PerformanceDataCollection[]> {
    if (!this.performanceMeasurer) {
      throw new Error("PerformanceMeasurer not started");
    }

    const iteration = await this.performanceMeasurer.stop(2000);

    const result: TestCaseResult = {
      iterations: [iteration],
      name: "Action",
      status: iteration.status,
    };

    return [new PerformanceDataCollection(result)];
  }
}
