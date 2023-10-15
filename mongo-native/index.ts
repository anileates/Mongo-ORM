import express from 'express';
import { MongoClient } from 'mongodb';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {

});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});