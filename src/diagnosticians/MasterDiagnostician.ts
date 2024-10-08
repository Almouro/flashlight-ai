import { Diagnostician, Diagnostic } from "../interfaces";

/**
 * Helper class to combine all diagnosticians into one.
 */
export class MasterDiagnostician implements Diagnostician {
  constructor(private diagnosticians: Diagnostician[]) {}

  async startSession(): Promise<void> {
    for (const diagnostician of this.diagnosticians) {
      await diagnostician.startSession();
    }
  }
  async startActionDiagnostic(): Promise<void> {
    for (const diagnostician of this.diagnosticians) {
      await diagnostician.startActionDiagnostic();
    }
  }
  async endActionDiagnostic(): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];
    for (const diagnostician of this.diagnosticians) {
      diagnostics.push(...(await diagnostician.endActionDiagnostic()));
    }

    return diagnostics;
  }
  async endSession(): Promise<void> {
    for (const diagnostician of this.diagnosticians) {
      await diagnostician.endSession();
    }
  }
}
