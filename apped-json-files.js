import fs from "fs/promises";

const files = await fs.readdir("json");
const finalResult = [];

for (const file of files) {
  const buf = await fs.readFile(`json/${file}`, "utf-8");
  const array = JSON.parse(buf);
  finalResult.push(...array);
}

fs.writeFile("./total-items-data.json", JSON.stringify(finalResult));
