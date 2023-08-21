import fs from "fs/promises";
import { MongoClient, ObjectId } from "mongodb";
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
const VendorsCol = client.db("botitdev").collection("Vendors");
const vendorId = (await VendorsCol.findOne({ "name.en": /ezaby/i }))._id;

const updates = [];
let counter = 0;
for (const change of changes) {
  updates.push({
    updateOne: {
      filter: {
        _vendor: vendorId,
        refId: Number(change.A),
        "variants.price": { $exists: true },
      },
      update: {
        $set: {
          "variants.$.price": change.E,
        },
        $push: {
          "variants.$.inventory": {
            stock_quantity: change.D,
            inStock: change.D,
            branchId: change.C,
          },
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
