// invokeDirect.js - Debug version
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-south-1',
});

const lambda = new AWS.Lambda();

(async () => {
  try {
    // Check if input file exists
    const imgPath = path.join(__dirname, 'input.jpg');
    if (!fs.existsSync(imgPath)) {
      console.error("❌ input.jpg not found!");
      return;
    }

    // Read and base64‑encode the image
    const buffer = fs.readFileSync(imgPath);
    const base64 = buffer.toString("base64");
    
    console.log("📷 Image file size:", buffer.length, "bytes");
    console.log("📄 Base64 length:", base64.length, "characters");
    console.log("🔤 Base64 starts with:", base64.substring(0, 20));

    // Create the payload
    const payload = {
      body: base64,
      isBase64Encoded: true,
      imageType: "image/jpeg",
    };

    console.log("📦 Payload keys:", Object.keys(payload));
    console.log("📦 Payload structure:", {
      body: `[${payload.body.length} chars]`,
      isBase64Encoded: payload.isBase64Encoded,
      imageType: payload.imageType
    });

    // Direct invoke
    const params = {
      FunctionName: "myfunctionthird",
      InvocationType: "RequestResponse",
      Payload: JSON.stringify(payload),
    };

    console.log("🚀 Invoking Lambda...");
    const result = await lambda.invoke(params).promise();
    
    console.log("📊 Lambda response status:", result.StatusCode);
    console.log("📄 Raw Payload:", result.Payload);
    
    const res = JSON.parse(result.Payload);
    console.log("📄 Parsed response:", res);

    if (res.statusCode === 200 && res.isBase64Encoded && res.body) {
      fs.writeFileSync("out.jpg", Buffer.from(res.body, "base64"));
      console.log("✅ Compressed image written to out.jpg");
    } else {
      console.error("❌ Lambda returned an error:", res);
    }
  } catch (err) {
    console.error("💥 Invocation failed:", err);
  }
})();