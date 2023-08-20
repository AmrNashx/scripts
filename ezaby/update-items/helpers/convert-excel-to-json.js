import fs from "fs/promises";
import excelToJson from "convert-excel-to-json";
import path from "path";

export async function converExcelToJson(excelDirPath) {
  const files = await fs.readdir(path.resolve(excelDirPath));
  for (const file of files) {
    const { Grid } = excelToJson({
      sourceFile: path.resolve("path", file),
    });
    const fileWithoutExt = file.split(".")[0];
    fs.writeFile(`./json/${fileWithoutExt}.json`, JSON.stringify(Grid));
  }
}
