const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const router = require('./routes')
const cors = require('cors')

require('dotenv').config();

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

app.use(bodyParser.json());

const PORT = process.env.PORT || 4000

mongoose.connect(process.env.DB_URL)
    .then(() => { console.log('Connected to MongoDB Atlas'); })
    .catch(() => { console.error('Error connecting to MongoDB Atlas:', err); });

app.use('/', router);

    app.listen(PORT, () => {
        console.log(`Listening at http://localhost:${PORT}`);
    })
