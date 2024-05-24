const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const mongoDB =
  "mongodb+srv://mattHudson:DP4dNl1CZpV1fMe1@locallibrary.5udpszx.mongodb.net/local_library?retryWrites=true&w=majority&appName=LocalLibrary";

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoDB);
}
