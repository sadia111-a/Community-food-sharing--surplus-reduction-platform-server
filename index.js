const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t3yv0bn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const foodCollection = client.db("foodSharing").collection("foods");
    const requestCollection = client.db("foodSharing").collection("requests");

    app.get("/foods", async (req, res) => {
      const cursor = foodCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // app.get("/foods/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const options = {
    //     projection: {
    //       foodName: 1,
    //       donation_money: 1,
    //       food_id: 1,
    //       location: 1,
    //       date: 1,
    //       email: 1,
    //       food_img: 1,
    //     },
    //   };
    //   const result = await foodCollection.findOne(query, options);
    //   res.send(result);
    // });

    // food requests
    app.get("/requests", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await requestCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/foods", async (req, res) => {
      const newFood = req.body;
      console.log(newFood);
      const result = await foodCollection.insertOne(newFood);
      res.send(result);
    });

    app.post("/requests", async (req, res) => {
      const foodRequest = req.body;
      console.log(foodRequest);
      const result = await requestCollection.insertOne(foodRequest);
      res.send(result);
    });

    // update food
    app.put("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedFood = req.body;
      const food = {
        $set: {
          food_img: updatedFood.food_img,
          food_name: updatedFood.food_name,
          donator_img: updatedFood.donator_img,
          donator_name: updatedFood.donator_name,
          food_quantity: updatedFood.food_quantity,
          location: updatedFood.location,
          expired_date: updatedFood.expired_date,
          quality: updatedFood.quality,
        },
      };
      const result = await foodCollection.updateOne(filter, food, options);
      res.send(result);
    });

    // Delete food request
    app.delete("/requests/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await requestCollection.deleteOne(query);
      res.send(result);
    });

    // Delete food to manage
    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Food sharing server is running");
});

app.listen(port, () => {
  console.log(`food sharing server is running on port ${port}`);
});
