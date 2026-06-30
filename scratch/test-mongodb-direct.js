const { MongoClient } = require('mongodb');

// Construct direct connection string bypassing SRV DNS resolution
const uri = "mongodb://studiococoa249_db_user:xKTeamOUVKJqoo80@ac-zvreaky-shard-00-00.diwbkmo.mongodb.net:27017,ac-zvreaky-shard-00-01.diwbkmo.mongodb.net:27017,ac-zvreaky-shard-00-02.diwbkmo.mongodb.net:27017/seevent?ssl=true&replicaSet=atlas-gtu9kk-shard-0&authSource=admin&retryWrites=true&w=majority";

async function testDirect() {
  console.log("Connecting directly to MongoDB shards (bypassing SRV)...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("SUCCESS: Connected directly to MongoDB shards successfully!");
    const db = client.db('seevent');
    const databasesList = await client.db().admin().listDatabases();
    console.log("Available databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
  } catch (e) {
    console.error("ERROR: Direct connection failed!");
    console.error(e);
  } finally {
    await client.close();
  }
}

testDirect();
