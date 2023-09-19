import { MongoClient } from "mongodb";
import axios from "axios";

const client = new MongoClient(
  "mongodb+srv://devdb:UDBoHHLHrhjvyMnY@botit-dev.jwtve.mongodb.net/botitdev?retryWrites=true&w=majority"
);
async function main() {
  const ApiVendor = client.db().collection("ApiVendors");
  const Vendor = client.db().collection("Vendors");
  const MenuCategory = client.db().collection("MenuCategories");

  try {
    const apiVendors = await ApiVendor.find({
      integration: "Shopify",
      collections: { $exists: true },
    }).toArray();

    const updates = [];
    for (const apiVendor of apiVendors) {
      const name = apiVendor.info.name.en;
      const nameRegex = new RegExp(name, "i");
      const vendor = await Vendor.findOne({ "name.en": nameRegex });
      if (!vendor) continue;
      const vendorId = vendor._id;
      for (const collection of apiVendor.collections) {
        updates.push({
          updateOne: {
            filter: { _vendor: vendorId, "name.en": collection.name.en },
            update: { $set: { collectionId: collection.id } },
          },
        });
      }
    }

    await MenuCategory.bulkWrite(updates);
    console.log("DONE");
    client.close();
  } catch (error) {
    console.log(error);
  }
}

main();
