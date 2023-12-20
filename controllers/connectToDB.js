const uri = process.env.DB_STRING 
const { MongoClient, ServerApiVersion } = require('mongodb')
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
const connectToDB = async (dbName) => {
    try {
        // await client.connect(dbName)
        const db = client.db(dbName)
        console.log(`\nConnected to ${dbName} with this connections string\n\n ${uri} `);
        return db 
    } catch (err) {
        console.error(`Error connecting the db ${err}`)
    } /* finally {
        await client.close()
    }  */
  }
  module.exports = { connectToDB }