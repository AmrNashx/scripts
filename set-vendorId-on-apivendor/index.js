import { MongoClient } from "mongodb";

const devURI =
  "mongodb+srv://devdb:UDBoHHLHrhjvyMnY@botit-dev.jwtve.mongodb.net/botitdev?retryWrites=true&w=majority";
const client = new MongoClient(devURI);

const apiVendorCol = client.db("botitdev").collection("ApiVendors");
const vendorCol = client.db("botitdev").collection("Vendors");

function getApiVendorsWithNoVendorId() {
  return apiVendorCol.find({ "info.vendorId": { $exists: false } }).toArray();
}

async function getVendorIdOfApiVendor(apiVendor) {
  const regex = new RegExp(apiVendor.vendor, "i");
  const vendor = await vendorCol.findOne({ "name.en": regex });
  console.log(regex);
  return vendor ? vendor._id : null;
}

const apiVendors = await getApiVendorsWithNoVendorId();
const updates = [];

for (const apiVendor of apiVendors) {
  const vendorId = await getVendorIdOfApiVendor(apiVendor);
  console.log(apiVendor.vendor, vendorId);
  if (!vendorId) continue;
  updates.push({
    updateOne: {
      filter: { vendor: apiVendor.vendor },
      update: {
        $set: {
          "info.vendorId": vendorId,
        },
      },
    },
  });
  try {
    console.log("Writing to Database...");
    await apiVendorCol.bulkWrite(updates);
    client.close();
  } catch (error) {
    console.error(error);
  }
}
