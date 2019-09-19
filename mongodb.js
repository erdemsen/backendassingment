const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const connectionURL = 'mongodb://dbUser:dbPassword1@ds249623.mlab.com:49623/getir-case-study';

MongoClient.connect(connectionURL, {
    useNewUrlParser: true
}, (error, client) => {
    if (error) {
        return console.error('Unable to connect to database');
    }
    const db = client.db();

    var requestSample = {
        startDate: "2016-01-26",
        endDate: "2018-02-02",
        minCount: 2700,
        maxCount: 3000
    };

    db.collection('records').aggregate([{
            $match: {
                createdAt: {
                    $gte: new Date(requestSample.startDate),
                    $lt: new Date(requestSample.endDate)
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
                    $gte: requestSample.minCount,
                    $lt: requestSample.maxCount
                }
            }
        }
    ]).toArray((error, records) => {
        console.log(records);

    });
});