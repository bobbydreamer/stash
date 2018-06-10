const express = require('express');
const router = express.Router();

router.get('/categorycolor', (request, response) => {
    response.render('categorycolor.ejs',{
        pageTitle:'Stash - categoryColor',
        pageID: 'stashcategorycolor'
    });    
});

module.exports = router;