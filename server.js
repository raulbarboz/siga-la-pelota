const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ejs = require('ejs');
require('dotenv').config();
const firebase = require('firebase');
const Auth = require('./firebase.js');
const bodyParser = require('body-parser');
var device = require('express-device');
app.use(device.capture());

//let IP = process.env.IP || 'localhost';
let PORT = process.env.PORT || 8080;


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
        res.render('index', {snapshot: snapshot, device: req.device.type.toUpperCase()});
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
          Auth.getUserDataById(userLogged.uid).then((user) => {
            res.render('dashboard', {user: user, snapshot: snapshot});
          })
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
        res.render('userid', {user: userLogged, snapshot: snapshot, id: req.params.id})
      })
    }else{
      res.redirect('/')
    }
})

app.get('/deluser/:id', (req, res) => {
    if(userLogged){
      Auth.delUserDataById(req.params.id)
      .then((snapshot) => {
        res.render('userid', {user: userLogged, snapshot: snapshot, id: req.params.id})
      })
    }else{
      res.redirect('/')
    }
})

app.get('/delete/:id', (req, res) => {
    if(userLogged){
      Auth.deleteMessage(req.params.id)
      .then(() => {
        res.redirect('/notifications')
      })
    }else{
      res.redirect('/')
    }
})

app.get('/approve/:id', (req, res) => {
    if(userLogged){
      Auth.approveMessage(req.params.id)
      .then(() => {
        res.redirect('/notifications')
      })
    }else{
      res.redirect('/')
    }
})

app.post('/user/update/:id', (req, res) => {
    const userUpdate = {
      name: req.body.name,
      lastName: req.body.lastName
    }
    if(userLogged){
      Auth.updateUserDataById(req.params.id, userUpdate)
      .then(() => {
        if(userLogged.email != userUpdate.email){
        }
        res.redirect('/useradmin')
      })
    }else{
      res.redirect('/')
    }
})

app.get('/createuser', (req, res) => {
  if(userLogged){
    res.render('createuser')
  } else {
    res.redirect('/')
  }
})

app.post('/createuser', (req, res) => {
  Auth.SignUpWithEmailAndPassword(req.body.email,req.body.password).then((user) => {
     if(!user.err){
        let userData = JSON.parse(user)
        userData = userData.user
        Auth.insertUserData(userData).then(() => {
          res.redirect('/useradmin')
        })
     }else{
        return user.err
     }
 })
})

app.get('/alterar', (req, res) => {
  if(userLogged){
    res.render('alterar')
  } else {
    res.redirect('/')
  }
})

app.post('/alterar', (req, res) => {
  if(userLogged && req.body.newPassword.length > 0){
    Auth.updatePassword(req.body.newPassword).then((status) => {
      res.render('alterar', {msg: status})
    })
  } else {
    res.render('alterar', {msg: 'senha inválida'})
  }
})

app.post('/excluir', (req, res) => {
  if(userLogged){
    Auth.deleteUser(userLogged.uid).then((status) => {
      Auth.deleteAccount().then((status) => {
        res.redirect('/')
      })
    })
  } else {
    res.render('deletar', {msg: 'algo deu errado'})
  }
})


app.get('/excluir', (req, res) => {
  if(userLogged){
    res.render('excluir')
  } else {
    res.redirect('/')
  }
})

io.on('connection', function(socket){
   socket.on('sent message', function(msg){
    Auth.insertMessage(msg)
  });
});

http.listen(PORT, function(){
    
});
