const express = require('express');
const router = express.Router();
const firebase = require('firebase-admin');

router.get('/stash', (request, response) => {
    response.render('stash.ejs',{
        pageTitle:'Stash - Home',
        pageID: 'stash'
    });    
});

module.exports = router;