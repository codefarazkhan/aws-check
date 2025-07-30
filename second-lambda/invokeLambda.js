// invokeLambda.js
const AWS = require('aws-sdk');
require('dotenv').config();
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: 'ap-south-1',
  });
const lambda = new AWS.Lambda({ region: 'ap-south-1' });

const params = {
  FunctionName: 'myfunctionsecond',
  Payload: JSON.stringify({ name: 'Faraza' }),
};

lambda.invoke(params, (err, data) => {
  if (err) console.error(err);
  else console.log(JSON.parse(data.Payload));
});
