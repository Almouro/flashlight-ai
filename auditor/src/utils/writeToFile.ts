import fs from "fs";
import os from "os";

export const writeToFile = (filePath: string, data: object) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return filePath;
};

export const writeToTmpFile = (name: string, data: object) => {
  const filePath = `${os.tmpdir()}/${name}`;
  return writeToFile(filePath, data);
};
