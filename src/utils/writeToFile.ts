import fs from "fs";
import os from "os";

export const writeToFile = (name: string, data: object) => {
  const fileName = `${os.tmpdir()}/${name}`;
  fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
  return fileName;
};
