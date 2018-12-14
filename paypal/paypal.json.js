const { IP, PORT } = process.env;

module.exports = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": `http://${IP}:${PORT}/callback`,
        "cancel_url": `http://${IP}:${PORT}/cancel`
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Doação",
                "sku": "item",
                "price": "10.00",
                "currency": "BRL",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "BRL",
            "total": "10.00"
        },
        "description": "Esta é uma doação para o bloco de carnaval de rua SigaLaPelota"
    }]
};