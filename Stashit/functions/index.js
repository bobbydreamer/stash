// -- Project 2 - [Stash it] - Taking notes
// -- index.js is the main file

// requires
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

// Test file requies
//const dataFile = require('../public/samples/stash-export.json');

// variables
admin.initializeApp();
const app = express();
var db = admin.database();

// middleware
app.use(express.static('views'));   //Middleware for sharing files across routes  

app.set('view engine', 'ejs');          //Name of view engine
app.set('views', __dirname+'/views');   //Location of views
 
//Global files
//app.set('appData', dataFile);

// Routes - When adding new routes update firebase.json in root folder
app.use(require('./routes/stash'));
app.use(require('./routes/get'));
app.use(require('./routes/put'));
app.use(require('./routes/categorycolor'));
app.use(require('./routes/category'));
app.use(require('./routes/profile'));
app.use(require('./routes/feedback'));

app.get('/', (request, response) => {
    response.render('stashlogin.ejs', {
        pageTitle:'Stash - Login',
        pageID: 'stashlogin'
    });    
});

app.get('/category/:categoryId', (request, response) => {
    var categoryId = request.params.categoryId;
    var pgTitle = 'Stash - Category/'+categoryId;
    response.render('categoryTopics.ejs', {
        pageTitle: pgTitle,
        pageID: categoryId,
        categoryId : categoryId
    });    
});

app.get('/put/:noteId', (request, response) => {
    var noteId = request.params.noteId;
    var pgTitle = 'Stash - Category/'+noteId;
    response.render('updateNote.ejs', {
        pageTitle: pgTitle,
        pageID: 'stashUpdateNote',
        noteId : noteId
    });    
});

app.get('/delete/:uid/:cat/:noteId', (request, response) => {
    let updates = {};
    var uid = request.params.uid;
    var cat = request.params.cat;
    var noteId = request.params.noteId;
    console.log('UID:',uid,', category:',cat,', noteId:', noteId);

    updates['/stash/' + uid + '/' + noteId ] = null;
    updates['/categories/' + uid + '/' + cat + '/topics/' + noteId] = null;
    db.ref().update(updates);            
});


app.get('/timestamp', (request, response) => {
    response.send(`${Date.now()}`);
});

exports.app = functions.https.onRequest(app);
/*
// Keeps track of the length of the 'likes' child list in a separate property.
exports.countchange = functions.database.ref('categories/{uid}/{category}/topicsInfo/{topicid}')
    .onWrite( (change) => {
      const collectionRef = change.after.ref.parent;
      const countRef = collectionRef.parent.child('count');

      let increment;
      if (change.after.exists() && !change.before.exists()) {
        increment = 1;
      } else if (!change.after.exists() && change.before.exists()) {
        increment = -1;
      } else {
        return null;
      }

      // Return the promise from countRef.transaction() so our function
      // waits for this async event to complete before it exits.
      return countRef.transaction((current) => {
        return (current || 0) + increment;
      }).then(() => {
        return console.log('Counter updated.');
      });
    });

// If the number of likes gets deleted, recount the number of likes
exports.recount = functions.database.ref('categories/{uid}/{category}/count').onDelete((snap) => {
  const counterRef = snap.ref;
  const collectionRef = counterRef.parent.child('topicsInfo');

  // Return the promise from counterRef.set() so our function
  // waits for this async event to complete before it exits.
  return collectionRef.once('value')
      .then((messagesData) => {
          if(messagesData.numChildren() > 0)
             counterRef.set(messagesData.numChildren());
      });
});
*/

/*
// If the number of likes gets deleted, recount the number of likes
exports.recount = functions.database.ref('/categories/{uid}/{category}/topicsInfo').onWrite((snap) => {
    const topicsRef = snap.ref
    const counterRef = topicsRef.parent.child('count');

    // Return the promise from counterRef.set() so our function
    // waits for this async event to complete before it exits.
    return topicsRef.once('value')
        .then((messagesData) => {
               counterRef.set(messagesData.numChildren());
        });
  });
*/