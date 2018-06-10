const express = require('express');
const router = express.Router();

router.get('/put', (request, response) => {
    response.render('put.ejs',{
        pageTitle:'Stash - Put',
        pageID: 'stashput'
    });    
});

module.exports = router;