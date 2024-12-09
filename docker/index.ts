import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/meow", (req, res) => {
  res.send("Meow");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
