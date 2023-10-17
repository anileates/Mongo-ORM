import { Request, Response } from "express";
import User from "./models/user.model";
import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import Transfer from "./models/transfer.model";

let now = require("performance-now");

const generateRandomUser = () => {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    balance: 10000,
  };
};

const createUser = async (req: Request, res: Response) => {
  const { firstName, lastName, balance } = req.body;

  const user = new User({
    firstName,
    lastName,
    balance,
  });

  await user.save();

  res.status(200).json(user);
};

const insertManyUsers = async (req: Request, res: Response) => {
  const users = faker.helpers.multiple(generateRandomUser, {
    count: 100000,
  });

  let start = now();

  await User.insertMany(users);

  let end = now();
  console.log(`Insert many users took: ${end - start} milliseconds.`);

  return res.sendStatus(201);
};

const createManyUsers = async (req: Request, res: Response) => {
  const users = faker.helpers.multiple(generateRandomUser, {
    count: 100,
  });

  let start = now();

  await User.insertMany(users);

  let end = now();
  console.log(`Create many users took: ${end - start} milliseconds.`);

  return res.sendStatus(201);
};

const findUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id);

  return res.status(200).json(user);
};

const findOneAndUpdateBalance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { balance } = req.body;

  let start = now();

  const updated = await User.findOneAndUpdate(
    { _id: id },
    { $set: { balance } }
  );

  console.log(`Update user balance took: ${now() - start} milliseconds.`);

  return res.status(200).json(updated);
};

const updateUserBalance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { balance } = req.body;

  let start = now();

  const user = await User.findById(id);
  user!.balance = balance;
  await user!.save();

  console.log(`Update user balance took: ${now() - start} milliseconds.`);

  return res.status(200).json(user);
};

const createMoneyTransfer = async (req: Request, res: Response) => {
  const { sender, receiver, amount } = req.body;

  let start = now();

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const opts = { session };

    const userFrom = await User.findById(sender);
    userFrom!.balance -= amount;
    
    const userTo = await User.findById(receiver);
    userTo!.balance += amount;
    await userTo!.save(opts);
    
    const transfer = await Transfer.create({
      sender,
      receiver,
      amount,
    });

    userFrom!.transfers.push(transfer._id);
    await userFrom!.save(opts);
    
    await session.commitTransaction();
    session.endSession();

    let end = now();
    console.log(`Transfer took: ${end - start} milliseconds.`);


    return res.status(200).json({ message: "Transfer completed" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.log(error);
    return res.status(500).json(error);
  }
};

const getUserTransfers = async (req: Request, res: Response) => {
  const { id } = req.params;

  // Get user with his transfers
  const user = await User.findById(id).populate("transfers");

  return res.status(200).json(user);
}

export {
  createUser,
  findUserById,
  insertManyUsers,
  createManyUsers,
  updateUserBalance,
  findOneAndUpdateBalance,
  createMoneyTransfer,
  getUserTransfers
};
