import { MongoClient } from "mongodb";

const botitdev = new MongoClient(
  "mongodb+srv://devdb:UDBoHHLHrhjvyMnY@botit-dev.jwtve.mongodb.net/botitdev?retryWrites=true&w=majority"
).db("botitdev");
const botitprod = new MongoClient(
  "mongodb+srv://proddb:mrfjThG5vBx4rHqz@botit-prod.jwtve.mongodb.net/botitprod?retryWrites=true&w=majority"
).db("botitprod");
const itemsCol = botitdev.collection("Items");
const vendorsCol = botitdev.collection("Vendors");

const vendorId = (await vendorsCol.findOne({ "name.en": /eza/i }))._id;
const items = await itemsCol.find({ _vendor: vendorId }).toArray();

console.log("Fetched Items: ", items.length);

const insertResult = await botitprod.collection("Items").insertMany(items);

console.log("Insereted Items: ", insertResult);

process.exit(0);
