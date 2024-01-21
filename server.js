const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const router = require('./routes')

const app = express();

const PORT = process.env.PORT || 3000

app.use(bodyParser.json());

mongoose.connect(process.env.DB_URL)
    .then(() => { console.log('Connected to MongoDB Atlas'); })
    .catch(() => { console.error('Error connecting to MongoDB Atlas:', err); });

app.use('/', router);

    app.listen(PORT, () => {
        console.log(`Listening at http://localhost:${PORT}`);
    })
