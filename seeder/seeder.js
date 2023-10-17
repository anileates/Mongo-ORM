const { faker } = require("@faker-js/faker");
const { MongoClient } = require("mongodb");

const MONGO_HOST_ADDRESS = "mongodb://127.0.0.1:27017/test";
const mongoClient = new MongoClient(MONGO_HOST_ADDRESS);

let now = require("performance-now");

mongoClient
  .connect()
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!");
  })
  .catch((error) => {
    console.log(`❌ MongoDB Connection Error: ${error}`);
  });

const db = mongoClient.db("performance");
const userCollection = db.collection("users");
const transferCollection = db.collection("transfers");

const generateRandomUser = () => {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    balance: 10000,
  };
};

const seedUserCollection = async (numberOfUsers) => {
  const users = faker.helpers.multiple(generateRandomUser, {
    count: numberOfUsers,
  });

  try {
    let start = now();
    await userCollection.insertMany(users);

    let end = now();

    console.log(`✅ Seeding successful! ${numberOfUsers} users are inserted. Took ${end - start} milliseconds.`);
  } catch (error) {
    console.log(`❌ Something went wrong while seeding the database: ${error}`);
  }
};

// This method generates one random transfer for each user.
const seedTransferCollection = async () => {
  const userIds = await userCollection
    .find({}, { _id: 1, firstName: 0, lastName: 0, balance: 0 })
    .project({ _id: 1 })
    .toArray();

  try {
    let transfers = [];
    for (let user of userIds) {
      const randomAmount = faker.finance.amount(10, 500, 2);
      const randomUserId =
        userIds[Math.floor(Math.random() * userIds.length)]._id;

      await userCollection.findOneAndUpdate(
        { _id: user._id },
        { $inc: { balance: -randomAmount } }
      );

      let transfer = {
        sender: user._id,
        receiver: randomUserId,
        amount: randomAmount,
      };

      transfers.push(transfer);
    }

    await transferCollection.insertMany(transfers);
    console.log(
      `✅ Seeding successful! ${transfers.length} transfers are inserted.`
    );
  } catch (error) {
    console.log(`❌ Something went wrong while seeding the database: ${error}`);
  }
};

seedUserCollection(100000).then(() => {
  seedTransferCollection().then(() => mongoClient.close());
});