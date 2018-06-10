const express = require('express');
const router = express.Router();

router.get('/get', (request, response) => {
    response.redirect('/category');    
    // response.render('get.ejs',{
    //     pageTitle:'Stash - Get',
    //     pageID: 'stashget'
    // });    
});

module.exports = router;