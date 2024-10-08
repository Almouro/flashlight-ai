import { ActionType } from "../controllers/actionController";
import { PlatformDriver } from "../interfaces";
import { waitFor } from "../utils/waitFor";
import { executeCommand } from "./shell";

export class AndroidDriver implements PlatformDriver {
  async performAction(action: ActionType): Promise<void> {
    switch (action.action.type) {
      case "tap":
        const { x, y } = action.action.data;
        await this.tap({ x, y });
        break;
      case "swipe":
        const { x1, y1, x2, y2, duration } = action.action.data;
        await this.swipe({
          x1,
          y1,
          x2,
          y2,
          duration,
        });
        break;
      case "text":
        const { text } = action.action.data;
        await this.type({ text });
        break;
    }
  }

  async snapshot() {
    return {
      hierarchyDump: await this.getXMLTree(),
    };
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
    const command = `adb shell input swipe ${x1} ${y1} ${x2} ${y2} ${50} && adb shell input swipe ${x1} ${y1} ${x2} ${y2} ${50}`;
    executeCommand(command);
    await waitFor(2000);
  }

  private async type({ text }: { text: string }) {
    // adb shell input text "hello world" doesn't seem to work and enter only hello
    // so we type word by word
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      executeCommand(`adb shell input text "${words[i]}"`);
      await waitFor(500);
      if (i < words.length - 1) {
        executeCommand(`adb shell input keyevent 62`);
        await waitFor(500);
      }
    }
  }
}
