import { profiler } from "@perf-profiler/profiler";
import {
  averageHighCpuUsage,
  getAverageFPSUsage,
  getScore,
  Report,
} from "@perf-profiler/reporter";
import { writeReport } from "@perf-profiler/web-reporter/dist/writeReport";
import { TestCaseResult, ThreadNames } from "@perf-profiler/types";
import kleur from "kleur";
import os from "os";

export class FlashlightReporter {
  static logReport({ results }: { results: TestCaseResult }) {
    const report = new Report(results);
    const score = getScore(report.getAveragedResult());

    const highCpuUsage = averageHighCpuUsage(results.iterations);
    const keys = Object.keys(highCpuUsage);

    let logReport = false;

    if (score > 80) {
      console.log(
        kleur.green(`🚀 Performance was good. Score: ${score}/100 ✅`)
      );
    } else {
      console.log(
        kleur.red(`🔥 Performance issues detected. Score: ${score}/100 ❌`)
      );
    }

    keys.forEach((key) => {
      if (key.startsWith("FrescoDecodeExe")) {
        logReport = true;
        console.log(
          kleur.red(
            `🔥 Heavy Fresco usage. You likely have heavy images on that screen`
          )
        );
      }

      if (key === "DefaultDispatch") {
        logReport = true;
        console.log(
          kleur.red(
            `🔥 Heavy Glide background thread usage. Check the networking tab and verify your images have the proper resolution.
Their resolution should be size x pixel density.`
          )
        );
      }

      if (key === ThreadNames.ANDROID.UI) {
        logReport = true;
        console.log(
          kleur.red(
            `🔥 Heavy UI Thread usage. Run profiling with Perfetto or Android Studio to investigate.`
          )
        );
      }

      if (key === "mqt_js") {
        logReport = true;
        console.log(
          kleur.red(
            `🔥 Heavy JS usage. Consider using React DevTools to debunk this issue.`
          )
        );
      }
    });

    const averageFps = getAverageFPSUsage(results.iterations[0].measures);

    // if (
    //   averageFps !== undefined &&
    //   averageFps < 57 &&
    //   results.iterations[0].time > 1
    // ) {
    //   logReport = true;
    //   console.log(kleur.red(`🔥 Low frame rate detected`));
    // }
  }
}
