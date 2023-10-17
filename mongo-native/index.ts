import express from 'express';
import { MongoClient } from 'mongodb';
import { createUser, findUserById, updateUserBalance } from './controllers';

const app = express();
app.use(express.json());

const MONGO_HOST_ADDRESS = "mongodb://localhost:27017/test";
const mongoClient = new MongoClient(MONGO_HOST_ADDRESS);
const db = mongoClient.db("performance");
const userCollection = db.collection("users");
const transferCollection = db.collection("transfers");

app.locals.mongoClient = mongoClient;
app.locals.userCollection = userCollection;
app.locals.transferCollection = transferCollection;

app.post('/user', createUser);
app.get('/user/:id', findUserById);
app.put('/user/:id', updateUserBalance);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});