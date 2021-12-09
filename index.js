const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.whaok.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db("tourX");
      const packageCollection = database.collection("packages");
      const allBookings = database.collection("bookings");


      // GET API
      app.get('/packages', async (req, res) => {
        const cursor = packageCollection.find({});
        const packages = await cursor.toArray();
        res.send(packages);
      })

      app.get('/package/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const package = await packageCollection.findOne(query);
        res.send(package);
      })

      app.get('/allBookings/:email', async (req, res) => {
        const email = req.params.email;
        const query = {email: email};
        const cursor = allBookings.find(query);
        const usersBookings = await cursor.toArray();
        res.send(usersBookings);
      })

      app.get('/allBookings', async(req, res) => {
        const cursor = allBookings.find({});
        const all_bookings = await cursor.toArray();
        res.send(all_bookings);
      })

      // Post API 
      app.post('/packages', async (req, res) => {
        const newPackage = req.body;
        const result = await packageCollection.insertOne(newPackage);
        res.send(result);
      })

      app.post('/allBookings', async (req, res) => {
        const newBooking = req.body;
        const result = await allBookings.insertOne(newBooking);
        res.json(result);
      });

      //UPDATE API
      app.put('/allBookings/:id', async (req, res) => {
        const id = req.params.id;
        const bookingUpdate = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
            $set: {
                status: bookingUpdate.status
            },
        };
        const result = await allBookings.updateOne(filter, updateDoc, options)
        console.log('updating', id)
        res.json(result)
      })

      // Delete API
      app.delete('/allBookings/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await allBookings.deleteOne(query);
        res.json(result);
      })
     
    } finally {
    //   await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
})
  
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})