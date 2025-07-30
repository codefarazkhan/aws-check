// index.js - Complete version with Sharp
const sharp = require('sharp');

exports.handler = async (event) => {
  console.log("=== FUNCTION STARTED ===");
  console.log("faraz");
  
  try {
    console.log("Event received:", JSON.stringify(event, null, 2));
    console.log("Event keys:", Object.keys(event));
    
    // Check for required fields
    if (!event.body || !event.isBase64Encoded) {
      console.log("❌ Missing required fields");
      console.log("Has body:", !!event.body);
      console.log("Has isBase64Encoded:", event.hasOwnProperty('isBase64Encoded'));
      
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing required fields: body and isBase64Encoded",
          received: Object.keys(event)
        }),
      };
    }

    console.log("✅ Required fields found");
    console.log("Body length:", event.body.length);
    console.log("isBase64Encoded:", event.isBase64Encoded);
    console.log("imageType:", event.imageType);

    // Process the image with Sharp
    console.log("🖼️ Starting image processing...");
    
    const imageBuffer = Buffer.from(event.body, 'base64');
    console.log("📦 Image buffer created, size:", imageBuffer.length, "bytes");
    
    const compressedBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 60 })
      .toBuffer();
    
    console.log("✅ Image compressed successfully");
    console.log("📦 Original size:", imageBuffer.length, "bytes");
    console.log("📦 Compressed size:", compressedBuffer.length, "bytes");
    console.log("📊 Compression ratio:", Math.round((1 - compressedBuffer.length / imageBuffer.length) * 100) + "%");

    const result = {
      statusCode: 200,
      isBase64Encoded: true,
      headers: { "Content-Type": event.imageType || "image/jpeg" },
      body: compressedBuffer.toString("base64"),
    };

    console.log("🎉 Returning success response");
    return result;

  } catch (err) {
    console.error("💥 Error occurred:", err);
    console.error("Error stack:", err.stack);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Image compression failed", 
        message: err.message,
        stack: err.stack 
      }),
    };
  }
};