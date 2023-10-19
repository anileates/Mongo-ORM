import express from "express";
import mongoose from "mongoose";
import {
  User,
  IncomingTransfer,
  OutgoingTransfer,
  Transfer,
} from "./models/models";
let now = require("performance-now");

const app = express();
app.use(express.json());

const MONGO_HOST_ADDRESS = "mongodb://127.0.0.1:27017/test";

mongoose
  .connect(MONGO_HOST_ADDRESS)
  .then(() => {
    console.log("MongoDB Connection Succesful");
  })
  .catch((err) => {
    console.error(err);
  });

// mongoose.set("debug", true);

app.post("/users", async (req, res) => {
  const { firstName, lastName, balance } = req.body;

  const user = new User({
    firstName,
    lastName,
    balance,
  });

  await user.save();

  return res.status(200).json(user);
});

app.post("/transfer", async (req, res) => {
  const { senderId, receiverId, amount } = req.body;

  let start = now();

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const sender = await User.findByIdAndUpdate(
      senderId,
      { $inc: { balance: -amount } },
      { session, returnOriginal: false}
    );

    const receiver = await User.findByIdAndUpdate(
      receiverId,
      { $inc: { balance: amount } },
      { session, returnOriginal: false }
    );

    await Transfer.create(
      [
        {
          sender: senderId,
          receiver: receiverId,
          amount,
        },
      ],
      { session }
    );

    // Delay 15 seconds for test reasons
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // or throw error to test rollback
    // throw new Error('Something went wrong');

    await session.commitTransaction();
    session.endSession();

    let end = now();
    console.log(
      "Transaction took " + (end - start).toFixed(3) + " milliseconds."
    );

    return res.status(200).json({ message: "Transfer completed", sender, receiver });
  } catch (error) {
    console.log(error);

    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({ message: "Transfer failed" });
  }
});

app.post("/transfer2", async (req, res) => {
  const { senderId, receiverId, amount } = req.body;

  let start = now();

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    await User.findByIdAndUpdate(
      senderId,
      {
        $inc: { balance: -amount },
        $push: { outgoingTransfers: { receiver: receiverId, amount } },
      },
      { session }
    );

    await User.findByIdAndUpdate(
      receiverId,
      {
        $inc: { balance: amount },
        $push: { incomingTransfers: { sender: senderId, amount } },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    let end = now();
    console.log(
      "Transaction took " + (end - start).toFixed(3) + " milliseconds."
    );

    return res.status(200).json({ message: "Transfer completed" });
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Transfer failed" });
  }
});

app.get("/users", async (req, res) => {
  const users = await User.find();

  return res.status(200).json(users);
});

//  if another request comes while the transfer money transaction is in progress, it will wait for the transaction to finish and then it will execute rather than throwing an error
app.put("/users/:id/change-user-name", async (req, res) => {
  const { newName } = req.body;

  try {
    const user = await User.findOneAndUpdate({ _id: req.params.id }, { firstName: newName }, { returnOriginal: false})
    return res.status(200).json({ message: "User name changed", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "User name change failed" });
  }
});

/**
 * If another request comes while the money transfer transaction is in progress, this method will fail because of the write conflict.
 */
app.put("/users/:id/change-user-name-with-transaction", async (req, res) => {
  const { newName } = req.body;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      { firstName: newName },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ message: "User name changed", user });
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "User name change failed" });
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
