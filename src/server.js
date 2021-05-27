//IMPORTS
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv/config");
const bodyParser = require("body-parser");
const app = express();
const publicDirectoryPath = path.join(__dirname, "../public");
//import Routes
const mainRoutes = require("./routes/mainRoutes");
const aimGaimRoutes = require("./routes/aimGaimRoutes");
//END IMPORTS

app.use(express.static(publicDirectoryPath));

app.use(
  bodyParser.urlencoded({
    limit: "5000mb",
    extended: true,
    parameterLimit: 100000000000,
  })
);

//Middleware
app.use(express.json());
//END Middleware

app.use("/", mainRoutes);
app.use("/", aimGaimRoutes);

//Conntect to DB
// mongodb+srv://gitgudadmin:skollosenord@cluster0.k5q5v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

// Bara för att stoppa deprecationmeddelande
mongoose.set("useCreateIndex", true);

mongoose.connect(
  process.env.DB_CONNECTION,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => {
    console.log("connected to db!");
  }
);

app.listen(3000, () => {
  console.log("Server is up on port 3000.");
});
