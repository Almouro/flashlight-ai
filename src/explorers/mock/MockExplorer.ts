import { ActionType } from "../../controllers/actionController";
import { StopType } from "../../controllers/stopController";
import { Explorer } from "../../interfaces";
import { mockExplorerActions } from "./mockExplorerActions";

export class MockExplorer implements Explorer {
  private actions = [mockExplorerActions.at(0), mockExplorerActions.at(-1)];

  getNextAction(_hierarchyDump: string): Promise<ActionType | StopType> {
    const nextAction = this.actions.shift();

    if (!nextAction) {
      throw new Error("No more actions to perform");
    }

    return Promise.resolve(nextAction);
  }
}
