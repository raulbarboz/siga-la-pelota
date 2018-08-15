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
        return 'The password is too weak.'
    } else {
      return {err: errorMessage }
    }
    return {err: error}
    });
}

module.exports.SignInWithEmailAndPassword = (email, password) => {
 firebase.auth().signInWithEmailAndPassword(email, password)
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode === 'auth/wrong-password') {
            console.log('Wrong password.');
          } else {
            console.log(errorMessage);
          }
          console.log(error);
        });   
}


module.exports.UserId = () => {

}

module.exports.insertUserData = (user) => {
  firebase.database().ref(`users/${user.uid}`).set({
    userEmail: user.email,
    isAdmin: true
  })
}


return module.exports