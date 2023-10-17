import { Request, Response } from "express";
import { Collection, Document, MongoClient, ObjectId } from "mongodb";

const createUser = async (req: Request, res: Response) => {
  const { firstName, lastName, balance } = req.body;
  const userCollection: Collection = req.app.locals.userCollection;

  const user = await userCollection.insertOne({
    firstName,
    lastName,
    balance,
  });

  res.status(200).json(user);
};

const findUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userCollection: Collection = req.app.locals.userCollection;

  const user = await userCollection.findOne({ _id: new ObjectId(id) });

  return res.status(200).json(user);
};

const updateUserBalance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { balance } = req.body;
  const userCollection: Collection = req.app.locals.userCollection;

  const user = await userCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { balance } }
  );

  return res.status(200).json(user);
};

export { createUser, findUserById, updateUserBalance };