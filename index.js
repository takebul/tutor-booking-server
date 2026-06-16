// const dns = require("node:dns");
// dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
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

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
);

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

async function run() {
  try {
    // await client.connect();
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );

    const db = client.db("TutorBooking");
    const tutorDataCollection = db.collection("tutorData");
    const myTutorDataCollection = db.collection("myTutorData");

    app.get("/tutorsFeatures", async (req, res) => {
      const result = await tutorDataCollection.find().limit(6).toArray();
      res.send(result);
    });

    app.get("/tutors/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const result = await tutorDataCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.get("/tutors", async (req, res) => {
      const search = req.query.search?.trim();
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;

      const query = {};

      // Search Filter
      if (search && search !== "undefined") {
        query.$or = [
          {
            tutorName: {
              $regex: search,
              $options: "i",
            },
          },
          {
            subjectCategory: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }

      // Date Filter
      if (startDate || endDate) {
        query.sessionStartDate = {};

        if (startDate) {
          query.sessionStartDate.$gte = startDate;
        }

        if (endDate) {
          query.sessionStartDate.$lte = endDate;
        }
      }

      const result = await tutorDataCollection
        .find(query)
        .sort({ _id: -1 })
        .toArray();

      res.send(result);
    });

    app.post("/tutors", verifyToken, async (req, res) => {
      const TutorData = req.body;
      TutorData.remainingSlots = parseInt(TutorData.remainingSlots);
      const result = await tutorDataCollection.insertOne(TutorData);
      res.send(result);
    });

    app.get("/myTutors/:tutorId", verifyToken, async (req, res) => {
      const { tutorId } = req.params;
      const result = await tutorDataCollection
        .find({ tutorId: tutorId })
        .toArray();
      res.send(result);
    });

    app.get("/myTutor/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const result = await tutorDataCollection.findOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });

    app.patch("/myTutor/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const updatedTutorData = req.body;
      const result = await tutorDataCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedTutorData },
      );
      res.send(result);
    });

    app.delete("/myTutor/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const result = await tutorDataCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.patch("/tutors/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const tutorData = req.body;

      const tutor = await tutorDataCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!tutor) {
        return res.status(404).json({
          message: "Tutor Not Found",
        });
      }

      if (tutor.remainingSlots <= 0) {
        return res.status(400).json({
          message:
            "This session is fully booked. You can't join at the moment.",
        });
      }

      const today = new Date();
      const sessionDate = new Date(tutor.sessionStartDate);

      if (today < sessionDate) {
        return res.status(400).json({
          message: "Booking is not available yet for this tutor",
        });
      }

      await tutorDataCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $inc: {
            remainingSlots: -1,
          },
          $set: {
            lastEnrolledAt: new Date(),
          },
        },
      );

      const result = await myTutorDataCollection.insertOne({
        ...tutorData,
        status: "pending",
        enrolledAt: new Date(),
      });

      res.send({
        success: true,
        message: "Booking Successful",
        result,
      });
    });

    app.get("/tutorBookedData", verifyToken, async (req, res) => {
      const result = await myTutorDataCollection
        .find()
        .sort({ _id: -1 })
        .toArray();
      res.send(result);
    });

    app.patch("/tutorBookedData/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const status = req.body;
      const result = await myTutorDataCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "Cancelled" } },
      );
      res.send(result);
    });
  } finally {
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
