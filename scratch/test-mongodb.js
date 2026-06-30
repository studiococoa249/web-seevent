const dns = require('dns');
// Set custom DNS resolvers to bypass local SRV resolution blocks
dns.setServers(['8.8.8.8', '1.1.1.1']);

const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://studiococoa249_db_user:xKTeamOUVKJqoo80@cluster0.diwbkmo.mongodb.net/?appName=Cluster0";

async function testConnection() {
  console.log("Connecting to MongoDB Atlas (using Google/Cloudflare DNS)...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("\n=======================================================");
    console.log("SUCCESS: Koneksi ke MongoDB Atlas BERHASIL didirikan!");
    console.log("=======================================================\n");
    
    // List databases
    const adminDb = client.db().admin();
    const databasesList = await adminDb.listDatabases();
    console.log("Daftar Database yang tersedia:");
    databasesList.databases.forEach(db => {
      console.log(` - ${db.name} (Ukuran: ${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
  } catch (e) {
    console.log("\n=======================================================");
    console.error("ERROR: Gagal terhubung ke MongoDB Atlas!");
    console.log("=======================================================\n");
    console.error(e);
  } finally {
    await client.close();
  }
}

testConnection();
