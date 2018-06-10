const express = require('express');
const router = express.Router();

router.get('/category', (request, response) => {
    response.render('category.ejs',{
        pageTitle:'Stash - All Categories',
        pageID: 'stashcategories'
    });    
});

module.exports = router;