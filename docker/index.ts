import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hallo Welt");
});

app.get("/name/:name", (req, res) => {
  const { name } = req.params;
  const dateNow = new Date();

  const nameFormatted = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  const dateFormatted = dateNow.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  res.send(`Hallo ${nameFormatted}. Heute ist der ${dateFormatted}.`);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
