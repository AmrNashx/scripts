import fs from "fs/promises";
import path from "path";

export async function appendJsonFiles(jsonDirPath) {
  const files = await fs.readdir(path.resolve(jsonDirPath));
  const finalResult = [];

  for (const file of files) {
    const buf = await fs.readFile(`json/${file}`, "utf-8");
    const array = JSON.parse(buf);
    finalResult.push(...array);
  }

  fs.writeFile("./total-items-data.json", JSON.stringify(finalResult));
}
