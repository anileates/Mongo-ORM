const { faker } = require("@faker-js/faker");
const { MongoClient } = require("mongodb");

const MONGO_HOST_ADDRESS = "mongodb://localhost:27017";
const mongoClient = new MongoClient(MONGO_HOST_ADDRESS);

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
    await userCollection.insertMany(users);

    console.log(`✅ Seeding successful! ${numberOfUsers} users are inserted.`);
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

seedUserCollection(1000).then(() => {
  seedTransferCollection().then(() => mongoClient.close());
});