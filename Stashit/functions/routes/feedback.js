const express = require('express');
const router = express.Router();

router.get('/feedback', (request, response) => {
    response.render('feedback.ejs',{
        pageTitle:'Stash - Feedback',
        pageID: 'stashfeedback'
    });    
});

module.exports = router;