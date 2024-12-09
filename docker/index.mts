import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT;
const passphrase = process.env.PASSPHRASE;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hallo Welt");
});

app.get("/name/:name", (req, res, next) => {
  const { name } = req.params;
  const authorization = req.get("authorization");

  if (!authorization) {
    res
      .setHeader("WWW-Authenticate", "Basic")
      .status(401)
      .send("Access denied");

    return next();
  }

  const decodedCredentials = Buffer.from(authorization.split(" ")[1], "base64")
    .toString()
    .split(":");
  const { 1: password } = decodedCredentials;

  if (password !== passphrase) {
    res
      .setHeader("WWW-Authenticate", "Basic")
      .status(401)
      .send("Access denied");

    return next();
  }

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
