const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

dotenv.config();

mongoose.connect(process.env.MONGO_URL, () => {
    console.log("Base de datos conectada");
})

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("common"));

const port = process.env.PORT || 443;

// Rutas

app.use("/api/users", require("./routes/users"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/verifications", require("./routes/verifications"));

// Correr el server

app.listen(port, () => {
    console.log('El servidor esta corriendo en el puerto: ', port);
});
