import fs from "fs/promises";
import { MongoClient } from "mongodb";

const changesJSON = await fs.readFile("./total-items-data.json", "utf-8");
const changes = JSON.parse(changesJSON);

const devURI =
  "mongodb+srv://devdb:UDBoHHLHrhjvyMnY@botit-dev.jwtve.mongodb.net/botitdev?retryWrites=true&w=majority";
const client = new MongoClient(devURI);
const ItemsCol = client.db("botitdev").collection("Items");

const updates = [];
for (const change of changes) {
  const item = await ItemsCol.findOne({ refId: Number(change.A) });
  if (!item) continue;

  updates.push({
    updateOne: {
      filter: { refId: Number(change.A), "variants.price": { $exists: true } },
      update: {
        $set: {
          "variants.$.price": change.E,
          "variants.$.inventory.$.inStock": true,
          "variants.$.inventory.$.branchId": change.C,
        },
      },
    },
  });
}

const res = await ItemsCol.bulkWrite(updates);
console.log(res);
client.close();
