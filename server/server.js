require("dotenv").config();
const express = require('express');
const morgan = require('morgan');//third party middleware
const db = require('./db');
const cors = require('cors');

const app = express();
//Top down approach-- Hence order matters
//Middleware is a function that will receive the request and forward it to the next middleware or the final middleware which is the route handler
app.use(cors());
app.use(morgan("dev"));//color-coded logs
app.use(express.json());//attaches the request body to property called body to the request object

app.use((req,res,next) => {
    console.log("yeah our middleware ran");
    next();
});

//get all restaurants
app.get('/api/v1/restaurants', async(req,res) => {
    try {
        const restaurantRatingsData = await db.query('SELECT * FROM restaurants LEFT JOIN (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id;');
        res.status(200).json({
            status: "success",
            results: restaurantRatingsData.rows.length,
            data: {
                restaurants: restaurantRatingsData.rows
            },
        });
    } catch(err) {
        console.log(err);
    }  
});

//get individual restaurant
app.get('/api/v1/restaurants/:id', async(req,res) => {
    try {
        // //const results = await db.query(`SELECT * from restaurants WHERE id=${req.params.id}`);
        //subject to sql injection
        const restaurant = await db.query(
            "SELECT * FROM restaurants LEFT JOIN (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id WHERE id=$1;",[req.params.id]
            ); //$1 is the placeholder
        
        //get all reviews of the restaurant
        const reviews = await db.query("SELECT * from reviews WHERE restaurant_id=$1",[req.params.id]);
        
        res.status(200).json({
            status: "success",
            results: restaurant.rows.length,
            data: {
                restaurant: restaurant.rows[0],
                reviews: reviews.rows
            },
        });
    } catch(err) {
        console.log(err);
    }
});

//create a restaurant
app.post('/api/v1/restaurants', async(req, res) => {
    console.log(req.body);
    try {
        const results = await db.query("INSERT INTO restaurants (name, location, price_range) values ($1,$2,$3) returning *",[req.body.name,req.body.location,req.body.price_range]); 
        res.status(201).json({
            status: "success",
            results: results.rows.length,
            data: {
                restaurant: results.rows[0]
            },
        });
    } catch(err) {
        console.log(err);
    }
});

//update a restaurant
app.put('/api/v1/restaurants/:id', async(req,res) => {
    try {
        const results = await db.query("UPDATE restaurants SET name=$1, location=$2, price_range=$3 WHERE ID=$4 returning *",[req.body.name,req.body.location,req.body.price_range,req.params.id]); 
        res.status(200).json({
            status: "success",
            results: results.rows.length,
            data: {
                restaurant: results.rows[0]
            },
        });
    } catch(err) {
        console.log(err);
    }
});

//delete a restaurant
app.delete('/api/v1/restaurants/:id', async(req,res) => {
    try {
        await db.query("DELETE from restaurants WHERE ID=$1",[req.params.id]); 
        res.status(204).json({
            status: "success",
        });
    } catch(err) {
        console.log(err);
    }
});

//create a review
app.post("/api/v1/restaurants/:id/addReview",async(req, res) => {
    try {
        const newReview = await db.query("INSERT INTO reviews (restaurant_id, name, review, rating) values ($1,$2,$3,$4) returning *",[req.params.id,req.body.name,req.body.review,req.body.rating]); 
        res.status(201).json({
            status: "success",
            data: {
                review: newReview.rows[0]
            },
        });
    } catch(err) {
        console.log(err);
    }
});

const PORT = 3001 || process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is up and is listening on port ${PORT}`);
});