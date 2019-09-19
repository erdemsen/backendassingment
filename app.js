const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const connectionURL = 'mongodb://dbUser:dbPassword1@ds249623.mlab.com:49623/getir-case-study';

var db;

// Connecting mongodb with MongoClient
MongoClient.connect(connectionURL, {
  useNewUrlParser: true
}, (error, client) => {
  if (error) {
    return console.error('Unable to connect to database');
  }
  db = client.db();
});

// Set up the express app
const app = express();

// Configure bodyparser to handle post requests
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/getir', (req, res) => {
  //getting request body
  const reqData = req.body;

  // checking for format of request
  if (reqData.startDate && reqData.endDate && reqData.minCount && reqData.maxCount) {
    
    // getting desired records from collection
    db.collection('records').aggregate([{
        $match: {
          createdAt: {
            $gte: new Date(reqData.startDate),
            $lt: new Date(reqData.endDate)
          }
        }
      },
      {
        $project: {
          _id: 0,
          key: 1,
          createdAt: 1,
          totalCount: {
            $sum: '$counts'
          }
        }
      },
      {
        $match: {
          totalCount: {
            $gte: parseInt(reqData.minCount, 10),
            $lt: parseInt(reqData.maxCount, 10)
          }
        }
      }
    ]).toArray((error, records) => {
      if (error) {
        res.status(400).send({
          code: 1,
          msg: 'DB connection error',
          error
        });
      } else {
        res.status(200).send({
          code: 0,
          msg: 'Success',
          records
        });
      }
    });
  } else {
    res.status(400).send({
      code: 2,
      msg: 'Invalid format of response body'
    });
  }
});

// Setting port for both local and server
var PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});