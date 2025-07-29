const axios = require('axios');

axios.post(
  'https://yhb4tvvvge.execute-api.ap-south-1.amazonaws.com/default/myfunctionfirst',
  { name: 'Yep!' },
  { headers: { 'Content-Type': 'application/json' } }
)
.then(res => {
  console.log("▶️ 200 OK:", res.data);
})
.catch(err => {
  // If the Lambda returned a JSON error, this will show it:
  if (err.response) {
    console.error("🚨 Status:", err.response.status);
    console.error("🚨 Body:", err.response.data);
  } else {
    console.error("🚨 Axios error:", err.message);
  }
});
