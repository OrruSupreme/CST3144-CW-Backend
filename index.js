// Setting up the express server
const express = require('express');
const { ObjectId, ReturnDocument } = require('mongodb');
const app = express();
const path = require('path');
var bodyParser = require('body-parser')

//Middleware setup
app.use(express.static("docs"));
app.use(bodyParser.json());

//Request Logger Middleware
const reqLogger = (req, res, next) => {
    console.log(
        `A ${req.method} request to the ${req.path} URL was made on ${new Date()}`
    );
    next()
}
app.use(reqLogger)


app.listen(3000, function () {
    console.log('Server started at port 3000')
})


// Importing required module
const { MongoClient } = require("mongodb");
//mongodb URI used to connect to a Atlas cluster
const databaseURL = "mongodb+srv://so956:4d3Icf30RSuc1MwB@cluster0.edg67.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const mongoClient = new MongoClient(databaseURL)
//accessing the project1 database 
const database = mongoClient.db("after_school_course");


// Establish a connection to the MongoDB server
function connect() {
    mongoClient.connect()
    let database = mongoClient.db('after_school_course')
    return database
}

//Create a mongodb instance
let mongoDatabase = connect();


/*Create new lesson*/
app.post('/lessons/', async (req, res) => {
    //try block to catch and handle errors
    try {
        //defined courses to represent the lessons collection in my MongoDB database allowing me to insert data
        const courses = database.collection("lessons")
        //defined data object to hold the data to be inserted into courses
        const data = {
            topic: req.body.topic,
            location: req.body.location,
            price: req.body.price,
            space: req.body.space
        }
        /* inserting the defined data into courses*/
        const result = await courses.insertOne(data);
        console.log(result);
    }
    /*if any error occurs in the try block the catch block will execute it*/
    catch (error) {
        console.error(error.message);
    }
    return res.send();

});

//Retrieve all lessons
app.get("/lessons/", async (req, res) => {
    try {
        const courses = database.collection("lessons")
        const result = await courses.find({}).toArray()
        const response = result.map((item) => {
            return {
                ...item,
                id: item._id.toString()
            }

        })
        res.json(response)
    } catch (error) {
        console.error(error.message);

    }
});
