const express = require('express');
const router = express.Router();

router.get('/profile', (request, response) => {
    response.render('profile.ejs',{
        pageTitle:'Stash - Profile',
        pageID: 'stashprofile'
    });    
});

module.exports = router;