const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://studiococoa249_db_user:xKTeamOUVKJqoo80@cluster0.diwbkmo.mongodb.net/?appName=Cluster0";

async function testWrite() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected successfully!");
    
    const db = client.db('seevent');
    const collection = db.collection('test_write');
    
    console.log("Inserting a test document into 'seevent.test_write'...");
    const result = await collection.insertOne({
      test: true,
      timestamp: new Date()
    });
    
    console.log("Insert result:", result);
    console.log("SUCCESS: Write operation succeeded!");
    
    // Clean up
    await collection.deleteOne({ _id: result.insertedId });
    console.log("Cleaned up test document successfully.");
  } catch (e) {
    console.error("ERROR: Write operation failed!");
    console.error(e);
  } finally {
    await client.close();
  }
}

testWrite();
