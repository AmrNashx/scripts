import { MongoClient } from "mongodb";
import axios from "axios";

const client = new MongoClient(
  "mongodb+srv://devdb:UDBoHHLHrhjvyMnY@botit-dev.jwtve.mongodb.net/botitdev?retryWrites=true&w=majority"
);

async function main() {
  const ApiVendor = client.db().collection("ApiVendors");

  const apiVendors = await ApiVendor.find({
    integration: "Shopify",
  }).toArray();
  const updates = [];
  for (const apiVendor of apiVendors) {
    let collections = {};
    if (apiVendor.authType === "apiKey") {
      try {
        const smartColURL = `${apiVendor.baseURL}/admin/api/2022-10/smart_collections.json`;
        const customColURL = `${apiVendor.baseURL}/admin/api/2022-10/custom_collections.json`;

        const {
          data: { smart_collections },
        } = await axios.get(smartColURL, {
          headers: {
            "X-Shopify-Access-Token":
              apiVendor.authCreds["X-Shopify-Access-Token"],
          },
        });
        const {
          data: { custom_collections },
        } = await axios.get(customColURL, {
          headers: {
            "X-Shopify-Access-Token":
              apiVendor.authCreds["X-Shopify-Access-Token"],
          },
        });

        const smartCollections = smart_collections.map((col) => ({
          id: col.id,
          name: { en: col.title },
          collectionType: "smart",
          active: true,
        }));

        const customCollections = custom_collections.map((col) => ({
          id: col.id,
          name: { en: col.title },
          collectionType: "custom",
          active: true,
        }));

        collections = [...smartCollections, ...customCollections];
        updates.push({
          updateOne: {
            filter: { vendor: apiVendor.vendor },
            update: { $set: { collections } },
          },
        });
      } catch (error) {
        console.log(error);
        continue;
      }
    } else if (apiVendor.authType === "basicAuth") {
      try {
        const domain = apiVendor.baseURL.split("//")[1];
        const { username, password } = apiVendor.authCreds;
        const baseURL = `https://${username}:${password}@${domain}`;
        const smartColURL = `${baseURL}/admin/api/2021-04/smart_collections.json`;
        const customColURL = `${baseURL}/admin/api/2021-04/custom_collections.json`;

        const {
          data: { smart_collections },
        } = await axios.get(smartColURL);
        const {
          data: { custom_collections },
        } = await axios.get(customColURL);

        const smartCollections = smart_collections.map((col) => ({
          id: col.id,
          name: { en: col.title },
          collectionType: "smart",
          active: true,
        }));

        const customCollections = custom_collections.map((col) => ({
          id: col.id,
          name: { en: col.title },
          collectionType: "custom",
          active: true,
        }));

        collections = [...smartCollections, ...customCollections];
        updates.push({
          updateOne: {
            filter: { vendor: apiVendor.vendor },
            update: { $set: { collections } },
          },
        });
      } catch (error) {
        console.log(error);
        continue;
      }
    }
  }
  await ApiVendor.bulkWrite(updates);
  client.close();
  console.log("DONE");
}
main();
