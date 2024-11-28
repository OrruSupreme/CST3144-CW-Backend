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


app.listen(4000, function () {
    console.log('Server started at port 4000')
})


// Importing required module
const { MongoClient } = require("mongodb");
//mongodb URI used to connect to a Atlas cluster
const databaseURL = "mongodb+srv://so956:4d3Icf30RSuc1MwB@cluster0.edg67.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const mongoClient = new MongoClient(databaseURL)
//accessing the project1 database 
const database = mongoClient.db("project1");


// Establish a connection to the MongoDB server
function connect() {
    mongoClient.connect()
    let database = mongoClient.db('project1')
    return database
}

//Create a mongodb instance
let mongoDatabase = connect();
