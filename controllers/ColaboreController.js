const Auth = require('../firebase.js');

class ColaboreController {
    request(req, res){
        Auth.getPayment().then((snapshot) => {
            var sum = snapshot.reduce( function( prevVal, elem ) {
                return prevVal + parseInt(elem.amount);
            }, 0 );
            let total = (sum*100)/3000;
            res.render('colabore', {total});
        })
        
    }
}

module.exports = new ColaboreController();