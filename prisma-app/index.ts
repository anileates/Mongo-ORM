import express from "express";
import { createUser, updateBalance, findUserById, insertManyUsers, createMoneyTransfer, getUserTransfers } from "./controller";

const app = express();
app.use(express.json());

app.post("/users", createUser);
app.get('/users/:id', findUserById)
app.post("/users/insert-many", insertManyUsers);
app.put('/users/:id/update-balance', updateBalance)

app.post('/transfers', createMoneyTransfer)
app.get('/user/:id/transfers', getUserTransfers);


app.listen(3002, () => {
  console.log("Server is running on http://localhost:3002");
});