// const dns = require("node:dns");
// dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 8541;

dotenv.config();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );

    const db = client.db("TutorBooking");
    const tutorDataCollection = db.collection("tutorData");

    app.get("/tutorsFeatures", async (req, res) => {
      const result = await tutorDataCollection.find().limit(6).toArray();
      res.send(result);
    });

    app.get("/tutors/:id", async (req, res) => {
      const { id } = req.params;
      const result = await tutorDataCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.get("/tutors", async (req, res) => {
      const result = await tutorDataCollection
        .find()
        .sort({ _id: -1 })
        .toArray();
      res.send(result);
    });

    app.post("/tutors", async (req, res) => {
      const TutorData = req.body;
      console.log(TutorData);
      const result = await tutorDataCollection.insertOne(TutorData);
      console.log(result);
      res.send(result);
    });

    app.get("/myTutors/:tutorId", async (req, res) => {
      const { tutorId } = req.params;
      const result = await tutorDataCollection
        .find({ tutorId: tutorId })
        .toArray();
      console.log(result);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running fine");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
