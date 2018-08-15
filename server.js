const express = require('express');
const app = express();
const ejs = require('ejs');
require('dotenv').config();
const firebase = require('firebase');
const Auth = require('./firebase.js');
const bodyParser = require('body-parser')
let IP = process.env.IP;
let PORT = process.env.PORT;



// prepare server
app.use(bodyParser.urlencoded({ extended: true })); 
app.use('/', express.static(__dirname + '/www')); // redirect root
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/style', express.static(__dirname + '/style/')); // redirect CSS bootstrap

let userLogged;

app.set('view engine', 'ejs');
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
        userLogged = user
       } else {
        userLogged = null;
        }
    });

app.get('/login', function(req, res) {
  console.log(req.body.email);
});

app.get('/', function(req, res){
    Auth.retrieveDataFromIndex().then((snapshot) => {
        res.render('index', {sound: false, snapshot: snapshot});
    })
});

app.get('/logout', function(req, res){
    firebase.auth().signOut().then(function() {
      console.log('logout');
      res.redirect('/')    
    }).catch(function(error) {
      // An error happened.
    });
});

app.get('/dashboard', function(req, res){
    if(userLogged){
    res.render('dashboard', {user: userLogged});
    }else{
    res.redirect('/')    
    }
});

Auth.SignInWithEmailAndPassword('ruzito@gmail.com','raulSCL123#');

Auth.SignUpWithEmailAndPassword('ruzito@gmail.com','raulSCL123#').then((user) => {
    if(!user.err){
       let userData = JSON.parse(user)
       userData = userData.user
       Auth.insertUserData(userData)
    }else{
        console.log(user.err)
    }
})

app.listen(PORT, IP, function(){
    console.log(`App running on http://${IP}:${PORT}`);
});