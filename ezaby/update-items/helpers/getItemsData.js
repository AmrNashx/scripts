import { appendJsonFiles } from "./append-json-files.js";
import { converExcelToJson } from "./convert-excel-to-json.js";

export async function getItemsData() {
  await converExcelToJson("../excel-sheets");
  await appendJsonFiles("../json");
}
