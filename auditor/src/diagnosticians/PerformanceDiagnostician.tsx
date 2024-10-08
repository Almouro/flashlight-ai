import {
  averageHighCpuUsage,
  getAverageCpuUsagePerProcess,
  getAverageFPSUsage,
  getScore,
  Report,
} from "@perf-profiler/reporter";
import { ThreadNames } from "@perf-profiler/types";
import kleur from "kleur";
import {
  Diagnostician,
  PerformanceDataCollection,
  Step,
  Diagnostic,
  Issue,
} from "../interfaces";

export class PerformanceDiagnostician implements Diagnostician {
  diagnoseStep(step: Step): Diagnostic {
    const performanceData = step.dataCollected
      .filter((data) => data instanceof PerformanceDataCollection)
      // TODO: make this better
      .at(0);

    if (!performanceData) {
      throw new Error("Performance data not collected");
    }

    const results = performanceData.results;

    const report = new Report(results);
    const score = getScore(report.getAveragedResult());

    const highCpuUsage = averageHighCpuUsage(results.iterations);
    const keys = Object.keys(highCpuUsage);

    const averagePerProcess = getAverageCpuUsagePerProcess(
      report.getAveragedResult().average.measures
    );

    const issues: Issue[] = [];

    if (
      results.iterations
        .flatMap((it) => it.measures)
        .find((measure) => {
          const processNames: string[] = Object.keys(measure.cpu.perName);
          const frescoKeys = processNames.filter((key) =>
            key.startsWith("FrescoDecodeExe")
          );

          console.log(
            frescoKeys,
            frescoKeys.map((key) => measure.cpu.perName[key])
          );

          return frescoKeys.find((key) => measure.cpu.perName[key] > 15);
        })
    ) {
      issues.push({
        description: kleur.red(
          `🔥 Heavy Fresco usage. You likely have heavy images on that screen`
        ),
      });
    }

    if (score > 80) {
      // issues.push(
      //   kleur.green(`🚀 Performance was good. Score: ${score}/100 ✅`)
      // );
    } else {
      issues.push({
        description: kleur.red(
          `🔥 Performance issues detected. Score: ${score}/100 ❌`
        ),
      });
    }

    keys.forEach((key) => {
      if (key.startsWith("FrescoDecodeExe")) {
        issues.push({
          description: kleur.red(
            `🔥 Heavy Fresco usage. You likely have heavy images on that screen`
          ),
        });
      }

      if (key === "DefaultDispatch") {
        issues.push({
          description:
            kleur.red(`🔥 Heavy Glide background thread usage. Check the networking tab and verify your images have the proper resolution.
Their resolution should be size x pixel density.`),
        });
      }

      if (key === ThreadNames.ANDROID.UI) {
        issues.push({
          description: kleur.red(
            `🔥 Heavy UI Thread usage. Run profiling with Perfetto or Android Studio to investigate.`
          ),
        });
      }

      if (key === "mqt_js") {
        const isScroll = step.action.type === "swipe";
        const jsConsumption = averagePerProcess.find(
          (measure) => measure.processName === "mqt_js"
        );

        issues.push({
          description: kleur.red(
            `🔥 Heavy JS usage (averaging ${
              jsConsumption?.cpuUsage
            }%). Consider using React DevTools to debunk this issue. ${
              isScroll
                ? "Consider using @shopify/flash-list if you're using FlatList here"
                : ""
            }`
          ),
        });
      }
    });

    const averageFps = getAverageFPSUsage(results.iterations[0].measures);

    // if (
    //   averageFps !== undefined &&
    //   averageFps < 57 &&
    //   results.iterations[0].time > 1
    // ) {
    //   issues.push(kleur.red(`🔥 Low frame rate detected`));
    // }

    return {
      issues,
    };
  }
}
