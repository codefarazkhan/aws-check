// dynamo-example.js
// Complete example: create table -> wait until ACTIVE -> put item -> get item
// Usage: set AWS credentials (aws configure) or env vars, then `node dynamo-example.js`
// To use DynamoDB Local, set DDB_LOCAL_URL (e.g. "http://localhost:8000")

const AWS = require("aws-sdk");
require('dotenv').config();

// Config: region and optional local endpoint
const REGION = process.env.AWS_REGION || "ap-south-1";
const DDB_LOCAL_URL = process.env.DDB_LOCAL_URL || null; // set to e.g. http://localhost:8000 to use DynamoDB Local

AWS.config.update({ region: REGION });

const dynamodb = new AWS.DynamoDB(
  DDB_LOCAL_URL ? { endpoint: DDB_LOCAL_URL, region: REGION } : {}
);
const docClient = new AWS.DynamoDB.DocumentClient(
  DDB_LOCAL_URL ? { service: dynamodb } : {}
);

const TABLE_NAME = "Users";

async function ensureTableExists() {
  const params = {
    TableName: TABLE_NAME,
    KeySchema: [
      { AttributeName: "UserId", KeyType: "HASH" } // partition key
    ],
    AttributeDefinitions: [
      { AttributeName: "UserId", AttributeType: "S" }
    ],
    // Use on-demand billing so you don't need provisioned throughput
    BillingMode: "PAY_PER_REQUEST"
  };

  try {
    console.log(`Creating table "${TABLE_NAME}"...`);
    await dynamodb.createTable(params).promise();
    console.log("✅ Table creation requested.");
  } catch (err) {
    if (err.code === "ResourceInUseException") {
      console.log(`ℹ️ Table "${TABLE_NAME}" already exists.`);
    } else {
      throw err;
    }
  }

  // Wait until the table exists and is ACTIVE
  console.log("Waiting for table to become ACTIVE...");
  await dynamodb.waitFor("tableExists", { TableName: TABLE_NAME }).promise();

  // Optional: describe table to show status
  const desc = await dynamodb.describeTable({ TableName: TABLE_NAME }).promise();
  console.log(`✅ Table status: ${desc.Table.TableStatus}`);
}

async function insertItem() {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      UserId: "u1",
      Name: "John Doe",
      Age: 30,
      Email: "john@example.com",
      CreatedAt: new Date().toISOString()
    }
  };

  await docClient.put(params).promise();
  console.log("✅ Item inserted.");
}

async function readItem() {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      UserId: "u1"
    }
  };

  const result = await docClient.get(params).promise();
  if (result.Item) {
    console.log("📦 Retrieved item:");
    console.log(result.Item);
  } else {
    console.log("⚠️ Item not found.");
  }
}

(async () => {
  try {
    console.log(`Using region: ${REGION}`);
    if (DDB_LOCAL_URL) console.log(`Using DynamoDB Local endpoint: ${DDB_LOCAL_URL}`);

    await ensureTableExists();
    await insertItem();
    await readItem();

    console.log("All done ✅");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
})();
