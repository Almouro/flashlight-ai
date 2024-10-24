import { ScreenRecorder } from "@perf-profiler/types";
import { ScreenRecorder as AndroidScreenRecorder } from "@perf-profiler/android/dist/src/commands/ScreenRecorder";
import { PlatformDriver } from "../interfaces";
import { waitFor } from "../utils/waitFor";
import { executeCommand } from "./shell";
import { ActionType } from "../tools/actions";
import { cleanupViewHierarchy } from "./cleanupViewHierarchy";

export class AndroidDriver implements PlatformDriver {
  async isKeyboardShown(): Promise<boolean> {
    const output = executeCommand(
      `adb shell dumpsys input_method | grep mInputShown`
    );
    return output.includes("mInputShown=true");
  }

  getScreenRecorder(file: string): ScreenRecorder {
    return new AndroidScreenRecorder(file);
  }

  async performAction(action: ActionType): Promise<void> {
    switch (action.type) {
      case "tap":
        const { x, y } = action.data.parameters;
        await this.tap({ x, y });
        break;
      case "swipe":
        const { x1, y1, x2, y2, duration } = action.data.parameters;
        await this.swipe({
          x1,
          y1,
          x2,
          y2,
          // Force FAST DURATION
          duration: 50,
        });
        break;
      case "type_text":
        const { text } = action.data.parameters;
        await this.type({ text });
        // Actually submit after typing
        executeCommand(`adb shell input keyevent 66`);
        break;
      case "back":
        executeCommand(`adb shell input keyevent 4`);
        break;
      case "submit":
        executeCommand(`adb shell input keyevent 66`);
        break;
      default:
        action satisfies never;
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async snapshot() {
    let tries = 0;

    while (tries < 3) {
      try {
        return {
          hierarchyDump: cleanupViewHierarchy(await this.getXMLTree()),
        };
      } catch (e) {
        tries++;
        await waitFor(500);
      }
    }

    throw new Error("Could not get the XML tree");
  }

  private async getXMLTree() {
    return executeCommand(
      `adb shell uiautomator dump > /dev/null && adb shell cat /sdcard/window_dump.xml`
    );
  }

  private async screenshot() {
    // Need to resize the image otherwise it can be too big to send to the GPT
    const RESIZE_RATIO = `10%`;

    return executeCommand(
      `adb shell screencap -p /sdcard/screenshot.png && adb pull /sdcard/screenshot.png && convert screenshot.png -resize ${RESIZE_RATIO} screenshot_small.png && cat screenshot_small.png | base64`
    ).replace("\n", "");
  }

  private async tap({ x, y }: { x: number; y: number }) {
    const command = `adb shell input tap ${x} ${y}`;
    executeCommand(command);
    await waitFor(2000);
  }

  private async swipe({
    x1,
    y1,
    x2,
    y2,
  }: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    duration: number;
  }) {
    const command = `adb shell input swipe ${x1} ${y1} ${x2} ${y2} ${50}`;
    // Double swipe because sometimes the first one doesn't work
    executeCommand(`${command} && ${command}`);
    await waitFor(4000);
  }

  private async type({ text }: { text: string }) {
    const escapedText = text
      .replace(/\\/g, "\\\\") // Escape backslashes
      .replace(/"/g, '\\"') // Escape double quotes
      .replace(/'/g, "\\'") // Escape single quotes
      .replace(/`/g, "\\`") // Escape backticks
      .replace(/ /g, "%s"); // Replace spaces with %s
    executeCommand(`adb shell input text "${escapedText}"`);
  }
}
