const express = require('express')
const app = express()
const dotenv = require('dotenv').config();
const port = process.env.PORT || 3500
const path = require('path')
const bodyParser = require('body-parser')
const { log } = require('console')


app.use(bodyParser.json())
app.set('view engine', 'ejs');

// TODO Handle cache


// Set the correct MIME type for JavaScript and css files
express.static.mime.types['js'] = 'application/javascript';
express.static.mime.types['css'] = 'text/css';

// static files
app.use('/', express.static(path.join(__dirname, '/static')))


// routes
app.use('/', require('./routes/root'))


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)    
})


// usersCollection.insertMany()
// usersCollection.find()
// usersCollection.findOne() - use this One + query operators https://www.mongodb.com/docs/manual/reference/operator/query/
// usersCollection.updateOne()
// how to select users? 
// How to structure the db? 
// how to update evetnst (1 by 1 or bulk or both)

