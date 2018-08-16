const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ejs = require('ejs');
require('dotenv').config();
const firebase = require('firebase');
const Auth = require('./firebase.js');
const bodyParser = require('body-parser')
let IP = process.env.IP || 'localhost';
let PORT = process.env.PORT || 3000;

var publicDir = require('path').join(__dirname,'/public');
// prepare server
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(publicDir));
app.use('/', express.static(__dirname + '/www')); // redirect root
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/style', express.static(__dirname + '/style/')); // redirect CSS bootstrap
app.set('view engine', 'ejs');

let userLogged;

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      userLogged = user
    } else {
      userLogged = null;
    }
});

app.post('/login', function(req, res) {
  let getBody = req.body
  Auth.SignInWithEmailAndPassword(getBody.email, getBody.password).then((login) => {
    if(!login.err){
      res.redirect('/dashboard')
    }else{
      res.redirect('/')
    }
  });
});

app.post('/update', function(req, res) {
  let getBody = req.body
  Auth.updateDataIndex(getBody).then(() => {
    res.redirect('/dashboard')
  })
});

app.get('/', function(req, res){
    Auth.retrieveDataFromIndex().then((snapshot) => {
        res.render('index', {snapshot: snapshot});
    })
});

app.get('/comentarios', function(req, res){
    Auth.getMessage().then((messageArrays) => {
        res.render('comentarios', {message: messageArrays.msgArrayApproved});
    })
});

app.get('/notifications', function(req, res){
    Auth.getMessage().then((messageArrays) => {
        res.render('notifications', {message: messageArrays.msgArray, messageApproved: messageArrays.msgArrayApproved});
    })
});

app.get('/logout', function(req, res){
    firebase.auth().signOut().then(function() {
      
      res.redirect('/')
    }).catch(function(error) {
      return error
    });
});

app.get('/dashboard', function(req, res){
    if(userLogged){
      Auth.retrieveDataFromIndex().then((snapshot) => {
          res.render('dashboard', {user: userLogged, snapshot: snapshot});
      })
    }else{
    res.redirect('/')
    }
});

app.get('/useradmin', (req, res) => {
    if(userLogged){
      Auth.getUserData()
      .then((snapshot) => {
        res.render('useradmin', {user: userLogged, snapshot: snapshot})
      })
    }else{
      res.redirect('/')
    }
})

app.get('/user/:id', (req, res) => {
    if(userLogged){
      Auth.getUserDataById(req.params.id)
      .then((snapshot) => {
        res.render('userid', {user: userLogged, snapshot: snapshot})
      })
    }else{
      res.redirect('/')
    }
})
// Auth.SignUpWithEmailAndPassword('raul.barboza@gmail.com','raulSCL123#').then((user) => {
//     if(!user.err){
//        let userData = JSON.parse(user)
//        userData = userData.user
//        Auth.insertUserData(userData)
//     }else{
//         console.log(user.err)
//     }
// })

io.on('connection', function(socket){
   socket.on('sent message', function(msg){
    Auth.insertMessage(msg)
  });
});

http.listen(PORT, IP, function(){
    console.log(`App running on http://${IP}:${PORT}`);
});
