import { AppDataCollection, DataCollector } from "../interfaces";

/**
 * Helper class to combine all collectors into one.
 */
export class MasterDataCollector implements DataCollector {
  constructor(private collectors: DataCollector[]) {}

  async startDataCollection(): Promise<void> {
    for (const collector of this.collectors) {
      await collector.startDataCollection();
    }
  }

  async endDataCollection(): Promise<AppDataCollection[]> {
    const dataCollection: AppDataCollection[] = [];
    for (const collector of this.collectors) {
      dataCollection.push(...(await collector.endDataCollection()));
    }

    return dataCollection;
  }
}
