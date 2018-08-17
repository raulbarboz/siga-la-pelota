const firebase = require('firebase');

var config = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID
};

firebase.initializeApp(config);

module.exports.retrieveDataFromIndex = () => {
  return firebase.database().ref('dataIndex').once('value')
  .then((snapshot) => {
    return snapshot.val()
  })
}


module.exports.SignUpWithEmailAndPassword = (email, password) => {
  return firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((user) => {
      return JSON.stringify(user)
    })
    .catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    if (errorCode == 'auth/weak-password') {
        return {err: 'The password is too weak.'}
    } else {
      return {err: errorMessage }
    }
    return {err: error}
    });
}

module.exports.SignInWithEmailAndPassword = (email, password) => {
 return firebase.auth().signInWithEmailAndPassword(email, password)
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode === 'auth/wrong-password') {
            return {err: 'Wrong password.'}
          } else {
            return {err: errorMessage}
          }
          return {err: error}
        });
}

module.exports.updateDataIndex = (data) => {
  return firebase.database().ref('dataIndex').set({
    description: data.description,
    warnings: data.warnings,
    date: data.date
  })
}

module.exports.UserId = () => {

}

module.exports.insertUserData = (user) => {
  firebase.database().ref(`users/${user.uid}`).set({
    userEmail: user.email,
    name: 'nome',
    lastName: 'sobrenome',
    isAdmin: false
  })
}

module.exports.getUserData = (user) => {
  return firebase.database().ref('users').once('value')
  .then((snapshot) => {
    let userArray = []
    snapshot.forEach((childSnapshot) => {
      userArray.push({
        id: childSnapshot.key,
        isAdmin: childSnapshot.val().isAdmin,
        userEmail: childSnapshot.val().userEmail,
        name: childSnapshot.val().name,
        lastName: childSnapshot.val().lastName
      })
    })
    return userArray
  })
}

module.exports.getUserDataById = (id) => {
  return firebase.database().ref(`users/${id}`).once('value')
  .then((snapshot) => {
    return snapshot.val();
  })
}

module.exports.insertMessage = (msg) => {
  firebase.database().ref('mensagens').push({
    message: msg,
    approved: false
  })
}

module.exports.getMessage = () => {
  return firebase.database().ref('mensagens').once('value')
  .then((snapshot) => {
    let msgArray = []
    let msgArrayApproved = []
    snapshot.forEach((childSnapshot) => {
      if(childSnapshot.val().approved === true){
        msgArrayApproved.push({
          id: childSnapshot.key,
          message: childSnapshot.val().message,
          approved: childSnapshot.val().approved
        })
      }else{
        msgArray.push({
          id: childSnapshot.key,
          message: childSnapshot.val().message,
          approved: childSnapshot.val().approved
        })
      }

    })
    return {msgArray, msgArrayApproved}
  })
}

return module.exports
