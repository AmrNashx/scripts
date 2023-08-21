import fs from "fs/promises";
import { MongoClient } from "mongodb";
import path from "path";

const changesJSON = await fs.readFile(
  path.resolve("ezaby", "update-items", "total-items-data.json"),
  "utf-8"
);
const changes = JSON.parse(changesJSON);

const devURI =
  "mongodb+srv://devdb:UDBoHHLHrhjvyMnY@botit-dev.jwtve.mongodb.net/botitdev?retryWrites=true&w=majority";
const client = new MongoClient(devURI);
const ItemsCol = client.db("botitdev").collection("Items");

const updates = [];
let counter = 0;
for (const change of changes) {
  updates.push({
    updateOne: {
      filter: {
        refId: Number(change.A),
        "variants.inventory": { $exists: true },
      },
      update: {
        $set: {
          "variants.$.price": change.E,
          "variants.$.inventory.0.stock_quantity": change.D,
          "variants.$.inventory.0.inStock": change.D > 0,
          "variants.$.inventory.0.branchId": change.C,
        },
      },
    },
  });
  console.log(`Updated Item number ${++counter}`);
}

let res;
try {
  console.log("Writing To Database...");
  res = await ItemsCol.bulkWrite(updates);
  console.log("Done");
} catch (error) {
  console.error(error);
}
console.log(res);

client.close();
