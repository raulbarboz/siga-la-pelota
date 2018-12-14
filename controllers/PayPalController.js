const paypal = require('paypal-rest-sdk');
const config = require('../paypal/config');
const Auth = require('../firebase.js');
const { HOST } = process.env;

class PayPalController{
    request(req, res){
        const id = req.params.id;
        let create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": `http://${HOST}/callback`,
                "cancel_url": `http://${HOST}/cancel`
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Doação",
                        "sku": "item",
                        "price": `${id}.00`,
                        "currency": "BRL",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "BRL",
                    "total": `${id}.00`
                },
                "description": "Esta é uma doação para o bloco de carnaval de rua SigaLaPelota"
            }]
        };
        
        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                res.status(error.httpStatusCode).send(error.response);
            } else {
                const id = payment.id;
                const amount = payment.transactions[0].amount.total;
                const approval_url = payment.links;
                const link = approval_url.find((link) => { return link.rel === 'approval_url' }).href
                Auth.insertPayment(id, amount).then(() => {
                    res.redirect(link)
                })
                
            }
        });
    }
    callback(req, res){
        const { paymentId, PayerID } = req.query;
        res.render('confirmacao', {paymentId, PayerID})
    }
    cancel(req, res){
        res.status(200).send('cancel')
    }
    
    confirm(req, res){
        const { paymentId, PayerID } = req.body;
        paypal.payment.execute(paymentId, { payer_id: PayerID }, (error, payment) => {
             if (error) {
                res.status(error.httpStatusCode).send(error.response);
            } else {
                Auth.approvePayment(paymentId).then(() => {
                    res.render('pagamentoConcluido');
                })
                
            }
        })
    }
}

module.exports = new PayPalController();