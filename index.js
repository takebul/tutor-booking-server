// const dns = require("node:dns");
// dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8541;
dotenv.config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running fine");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
