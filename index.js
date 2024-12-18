// Setting up the express server
const express = require('express');
const { ObjectId, ReturnDocument } = require('mongodb');
const app = express();
const path = require('path');
var bodyParser = require('body-parser')
const cors = require('cors');

app.use(cors());

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


app.listen(process.env.PORT || 4000, function () {
    console.log(`Server listening on port 4000`)
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

//get lesson by id
app.get('/lessons/:id', async (req, res) => {
    let course = {}
    try {
        const courses = database.collection("lessons");
        const filter = { _id: new ObjectId(req.params.id) };
        course = await courses.findOne(filter)
    } catch (error) {
        console.log(error)
    }
    return res.status(200).json(course);
})

app.post('/order/', async (req, res) => {
    if (req.body.hasOwnProperty('items') && req.body.items.length < 0 ) {
        return res.status(400).json('You cannot checkout an empty cart')
    }
    const courses = database.collection("orders");
    // req.body.items.map(async (item) => {
    //     try {
    //         // const filter = { _id: new ObjectId(item.id) };
    //         const filter = { _id: new ObjectId(item.id.trim()) };


    //         let course = await courses.findOne(filter)
    //         if (!course || !course?.space) {
    //             return res.status(400).json({err:'Error occured while trying to fulfill order!', course:course });

    //         }
    //         if (item?.quantity > course?.space) {
    //             return res.status(400).json(`Can't fulfill order as quantity specified for ${course?.topic} beyond available stock!`);
    //         }

    //     }
    //     catch (error) {
    //         console.error(error.message);
    //         return res.status(400).json({err:'Error occured while trying to fulfill order!', error:error, errorMessage: error.message})
    //     }
    // })
    for (const item of req.body.items) {
        try {
            const filter = { _id: new ObjectId(item.id) };
            const course = await courses.findOne(filter);
            if (!course || !course?.space) {
                return res.status(400).json({ err: 'Error occurred while trying to fulfill order!1', course });
            }
            if (item?.quantity > course?.space) {
                return res.status(400).json(`Can't fulfill order as quantity specified for ${course?.topic} beyond available stock!1`);
            }
        } catch (error) {
            console.error(error.message);
            return res.status(400).json({ err: 'Error occurred while trying to fulfill order!1', error });
        }
    }

    const order = database.collection("orders")

    result = await order.insertOne(req.body);
    try {
        req.body.items.map(async (item) => {
            const filter = { _id: new ObjectId(item.id) };
            let course = await courses.findOne(filter)
            if (!course || !course?.space) {
                return res.status(400).json({err:'Error occured while trying to fulfill order!', course:course });

            }
            const updateDoc = {
                $set: {
                    space: course?.space > 0 ? course?.space - item.quantity : 0
                },
            };
            await courses.updateOne(filter, updateDoc);
        });


    } catch (error) {
        console.error(error.message);
        return res.status(400).json({err:'Error occured while trying to fulfill order!', error:error, errorMessage: error.message})

    }

    return res.json("Order completed succesfully");

});


/*setting up a put route to update lessons attribute by id*/
app.put('/lessons/:id', async (req, res) => {
    let course = {}
    try {
        const courses = database.collection("lessons");
        const filter = { _id: new ObjectId(req.params.id) };
        console.log(req.params.id);
        course = await courses.findOne(filter)
        console.log(course)
        const updateDoc = {
            $set: {
                topic: req.body.topic || course.topic,
                location: req.body.location || course.location,
                price: req.body.price || course.price,
                space: req.body.space || course.space
            },
        };
        await courses.updateOne(filter, updateDoc);
        course = await courses.findOne(filter)
    } catch (error) {
        console.error(error.message);
    }
    return res.status(200).json(course);
})


//deleteby id
app.delete('/lessons/:id', async (req, res) => {
    try {
        const courses = database.collection("lessons");
        const filter = { _id: new ObjectId(req.params.id) };
        await courses.deleteOne(filter)
    } catch (error) {
        console.log(error)
    }
    return res.status(204).send()
})

//search route
app.get('/search/', async (req, res) => {
    const courses = await database.collection("lessons").find({
        topic: { $regex: `^${req.query.search_term}`, $options: "i" }
    }).toArray();
    const result = courses.map((item) => {
        return { ...item, id: item._id.toString() }
    })
    return res.json(result);
})

const img = path.resolve(__dirname, 'public');
app.use('/images', express.static(img, {fallthrough: true}));

app.use('/images', (req,res) =>{
    res.status(404).json({error:'Images not found'});
} )
