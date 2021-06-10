//IMPORTS
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv/config");
const bodyParser = require("body-parser");
const cors = require("cors");
const publicDirectoryPath = path.join(__dirname, "../public");
const hbs = require("hbs");

const app = express();
//import Routes

const mainRoutes = require("./routes/mainRoutes");
const aimGaimRoutes = require("./routes/aimGaimRoutes");
const reactionGameRoute = require("./routes/reactionGameRoutes");
const adminRoutes = require("./routes/adminRoutes");

//END IMPORTS

// Setup handlebars engine and views location
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");
hbs.registerPartials(partialsPath);
app.set("view engine", "hbs");
app.set("views", viewsPath);

app.use(express.static(publicDirectoryPath));
app.use(cors());

// Middlewares
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    limit: "5000mb",
    extended: true,
    parameterLimit: 100000000000,
  })
);
app.use(express.json());
//END Middleware

app.use("/", mainRoutes);
app.use("/", aimGaimRoutes);
app.use(reactionGameRoute);
app.use(adminRoutes);

//Connect to DB
// mongodb+srv://gitgudadmin:skollosenord@cluster0.k5q5v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

// Bara för att stoppa deprecationmeddelande
// mongoose.set("useCreateIndex", true);

mongoose.connect(
  process.env.DB_CONNECTION,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => {
    console.log("connected to db!");
  }
);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server is up on port 3000.");
});
