import { Request, Response, query } from "express";
import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

let now = require("performance-now");

const prisma = new PrismaClient({
  log: ["query"], // log all prisma queries
});

const generateRandomUser = () => {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    balance: 10000,
  };
};

const createUser = async (req: Request, res: Response) => {
  const { firstName, lastName, balance } = req.body;

  const users = await prisma.user.create({
    data: {
      firstName,
      lastName,
      balance,
    },
  });

  res.status(200).json(users);
};

const insertManyUsers = async (req: Request, res: Response) => {
  const users = faker.helpers.multiple(generateRandomUser, {
    count: 100000,
  });

  let start = now();
  await prisma.user.createMany({
    data: users,
  });

  let end = now();
  console.log(`Insert many users took: ${end - start} milliseconds.`);

  return res.sendStatus(201);
};

const findUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });

  return res.status(200).json(user);
};

const updateBalance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { balance } = req.body;

  let start = now();

  const updated = await prisma.user.update({
    where: { id },
    data: { balance },
  });

  let end = now();
  console.log(`Update user balance took: ${end - start} milliseconds.`);

  return res.status(200).json(updated);
};

const createMoneyTransfer = async (req: Request, res: Response) => {
  const { sender, receiver, amount } = req.body;

  try {
    let start = now();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: sender },
        data: { balance: { decrement: amount } },
      }),
      prisma.user.update({
        where: { id: receiver },
        data: { balance: { increment: amount } },
      }),
      prisma.transfer.create({
        data: {
          amount,
          sender: { connect: { id: sender } },
          receiver
        },
      }),
    ]);

    let end = now();
    console.log(`Transfer took: ${end - start} milliseconds.`);

    return res.sendStatus(201);
  } catch (error) {
    console.log("Transfer error: ", error)
    return res.sendStatus(500);
  }
};

const getUserTransfers =async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { transfers: true }
  });

  return res.status(200).json(user);
}



export {
  createUser,
  insertManyUsers,
  findUserById,
  updateBalance,
  createMoneyTransfer,
  getUserTransfers
};
