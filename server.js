const express = require("express");
const cors = require("cors");
// const morgan = require("morgan");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
 
// require("dotenv").config();

// var corsOptions = {
//   origin: "http://localhost:8081"
// };
app.use(
  cors({
    origin: "*",
  })
);

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");

db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

// // drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});
const routes = require("./app/routes/routes");
app.use("/api/v1", routes);

app.use("/api/v1/uploads", express.static("uploads"));
// require("./app/routes/user.routes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
