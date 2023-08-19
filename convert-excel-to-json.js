import path from "path";
import fs from "fs/promises";
import excelToJson from "convert-excel-to-json";

const files = await fs.readdir("excel-sheets");
for (const file of files) {
  const { Grid } = excelToJson({
    sourceFile: path.resolve("./excel-sheets", file),
  });
  const fileWithoutExt = file.split(".")[0];
  fs.writeFile(`./json/${fileWithoutExt}.json`, JSON.stringify(Grid));
}
