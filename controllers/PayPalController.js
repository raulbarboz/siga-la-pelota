const paypal = require('paypal-rest-sdk');
const create_payment_json = require('../paypal/paypal.json')
const config = require('../paypal/config');

class PayPalController{
    request(req, res){
        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                res.status(error.httpStatusCode).send(error.response);
            } else {
                const approval_url = payment.links;
                const link = approval_url.find((link) => { return link.rel === 'approval_url' }).href
                res.redirect(link)
            }
        });
    }
    callback(req, res){
        res.status(200).send('callback')
    }
    cancel(req, res){
        res.status(200).send('cancel')
    }
}

module.exports = new PayPalController();