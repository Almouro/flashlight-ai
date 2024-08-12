import { execSync } from "child_process";
import { waitFor } from "./utils/waitFor";
import { profiler } from "@perf-profiler/profiler";
import { Logger } from "@perf-profiler/logger";
import {
  averageHighCpuUsage,
  getAverageFPSUsage,
  getScore,
  Report,
} from "@perf-profiler/reporter";
import { writeReport } from "@perf-profiler/web-reporter/dist/writeReport";
import os from "os";
import fs from "fs";
import kleur from "kleur";
import { TestCaseResult, ThreadNames } from "@perf-profiler/types";

const bundleId = profiler.detectCurrentBundleId();

const executeCommand = (command: string) => execSync(command).toString();

console.log("====================================");
console.log("== 🤖 Welcome to Flashlight AI 🔦 ==");
console.log("====================================");
console.log("   ");

const resultsFolder = `${os.tmpdir()}/flashlight-ai-results`;
fs.mkdirSync(resultsFolder, { recursive: true });

class AndroidDriver {
  private async getXMLTree() {
    return executeCommand(
      `(adb shell uiautomator dump && adb pull /sdcard/window_dump.xml) > /dev/null && (cat window_dump.xml)`
    );
  }

  async snapshot() {
    console.log("🔎 Analyzing screen...");
    console.log("            ");

    return {
      hierarchyDump: await androidDriver.getXMLTree(),
    };
  }

  async screenshot() {
    // Need to resize the image otherwise it can be too big to send to the GPT
    const RESIZE_RATIO = `10%`;

    return executeCommand(
      `adb shell screencap -p /sdcard/screenshot.png && adb pull /sdcard/screenshot.png && convert screenshot.png -resize ${RESIZE_RATIO} screenshot_small.png && cat screenshot_small.png | base64`
    ).replace("\n", "");
  }

  async tap({
    x,
    y,
    slug,
    actionSlug,
  }: {
    x: number;
    y: number;
    slug: string;
    actionSlug: string;
  }) {
    const command = `adb shell input tap ${x} ${y}`;
    this.runFLTest({
      testCommand: command,
      slug,
      actionSlug,
    });

    const file = `${resultsFolder}/${actionSlug}.json`;
    const results: TestCaseResult = JSON.parse(
      fs.readFileSync(file).toString()
    );
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

    if (logReport) {
      const url = writeReport({
        jsonPaths: [file],
        outputDir: os.tmpdir(),
        duration: null,
        skip: 0,
      });
      console.log("   ");
      console.log(`📊 Check the full performance report: ${url}`);
    }

    console.log("    ");
    console.log("    ");
  }

  private runFLTest({
    testCommand,
    slug,
    actionSlug,
  }: {
    testCommand: string;
    slug: string;
    actionSlug: string;
  }) {
    execSync(
      `flashlight test --testCommand "${testCommand}" --duration 5000 --bundleId ${bundleId} --iterationCount 1 --resultsTitle ${slug} --resultsFilePath ${resultsFolder}/${actionSlug}.json --record --skipRestart`
    );
  }

  async swipe({
    x1,
    y1,
    x2,
    y2,
    slug,
    actionSlug,
  }: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    duration: number;
    slug: string;
    actionSlug: string;
  }) {
    const command = `adb shell input swipe ${x1} ${y1} ${x2} ${y2} ${50} && adb shell input swipe ${x1} ${y1} ${x2} ${y2} ${50}`;
    executeCommand(command);
    await waitFor(2000);
  }

  async type({ text }: { text: string }) {
    // adb shell input text "hello world" doesn't seem to work and enter only hello
    // so we type word by word
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      execSync(`adb shell input text "${words[i]}"`);
      await waitFor(500);
      if (i < words.length - 1) {
        execSync(`adb shell input keyevent 62`);
        await waitFor(500);
      }
    }
  }
}

export const androidDriver = new AndroidDriver();
