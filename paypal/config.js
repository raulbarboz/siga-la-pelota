const paypal = require('paypal-rest-sdk');
const { CLIENT_ID, CLIENT_SECRET } = process.env

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': CLIENT_ID,
  'client_secret': CLIENT_SECRET
});

module.exports = paypal;