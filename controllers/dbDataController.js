const { ObjectId } = require('mongodb');
const connect = require('./connectToDB')
const dbName = 'edoc'

//const usersCollection = connectToDB.collection(collectionName)


const readFromDB = async (collectionName, userId) => {
    try {
        const userToFind = {_id: new ObjectId(userId) }  
        const db = await connect.connectToDB(dbName)
        const collection = db.collection(collectionName)
        console.log(collection.collectionName);
        let result = await collection.findOne(userToFind)
        //console.log(`Data: ${JSON.stringify(result)}`);
        return result
    } catch (err){
        console.error(`Error loading collection to the db ${err}`)
    }        
}

module.exports = { readFromDB }