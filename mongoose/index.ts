import express from "express";
import mongoose from "mongoose";
import {
  createManyUsers,
  createUser,
  findUserById,
  insertManyUsers,
  findOneAndUpdateBalance,
  updateUserBalance,
  createMoneyTransfer,
  getUserTransfers
} from "./controllers";

const app = express();
app.use(express.json());

const MONGO_HOST_ADDRESS = "mongodb://127.0.0.1:27017";

mongoose
  .connect(MONGO_HOST_ADDRESS)
  .then(() => {
    console.log("MongoDB Connection Succesful");
  })
  .catch((err) => {
    console.error(err);
  });

mongoose.set("debug", true); // log all mongoose queries

app.post("/users", createUser);
app.get("/users/:id", findUserById);
app.post("/users/insert-many", insertManyUsers);
app.post("/users/create-many", createManyUsers);
app.put('/users/:id/find-and-update-balance', findOneAndUpdateBalance);
app.put('/users/:id/update-balance-save', updateUserBalance);
app.post('/transfers', createMoneyTransfer)
app.get('/user/:id/transfers', getUserTransfers);


app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
