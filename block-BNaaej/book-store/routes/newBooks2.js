let express = require('express');
let router = express.Router();
let Comment = require('../models/comments');
let Book = require('../models/books');

//list all books
router.get('/', (req, res, next) => {
    Book.find({}, (err, books) => {
        if(err) return next(err);
        res.status(200).json({books});
    })
});

//list a single book
router.get('/:id', (req, res, next) => {
    let id = req.params.id;
    Book.findById(id).populate('comments').exec((err, book) => {
        if(err) return next(err);
        res.status(200).json({book});
    })
});

//create a book
router.post('/', (req, res, next) => {
    console.log(req.body);
    Book.create(req.body, (err, book) => {
        if(err) return next(err);
        res.status(200).json({book});
    })
});

//update a book
router.put('/:id', (req, res, next) => {
    let id = req.params.id;
    Book.findByIdAndUpdate(id, req.body, (err, book) => {
        if(err) return next(err);
        res.status(200).json({book});
    })
});

//delete a book
router.delete('/:id', (req, res, next) => {
    let id = req.params.id;
    Book.findByIdAndDelete(id, (err, book) => {
        if(err) return next(err);
        Comment.deleteMany({booksId: id}, (err, result) => {
            if(err) return next(err);
            res.status(200).json({book});
        })
        
    })
});

//add comments
router.post('/:id/comments', (req, res, next) => {
    let id = req.params.id;
    req.body.bookId = id;
    Comment.create(req.body, (err, comment) => {
        if(err) return next(err);
        Book.findByIdAndUpdate(id, {$push: {comments: comment.id}}, (err, book) => {
            if(err) return next(err);
            res.status(200).json({comment});
        })
    })
});

//create a category
router.put('/:id/addCategory', (req, res, next) => {
    let id = req.params.id;
    req.body.category = req.body.category.trim().split(" ");
    Book.findByIdAndUpdate(id, req.body, (err, book) => {
        if(err) return next(err);
        res.status(200).json({book});
    })
});

//edit a category
router.put('/:id/editCategory', (req, res, next) => {
    let id = req.params.id;
    req.body.category = req.body.category.trim().split(" ");
    Book.findByIdAndUpdate(id, req.body, (err, book) => {
        if(err) return next(err);
        res.status(200).json({book});
    })
});

//list all categories
router.get('/list/Category', (req, res, next) => {
    Book.find({}).distinct('category').exec((err, category) => {
        if(err) return next(err);
        res.status(200).json({category})
    })
});

//list books by category
router.get('/list/byCategory', (req, res, next) => {
    Book.aggregate([
        {$unwind: "$category"}
    ]).exec((err, books) => {
        if(err) return next(err);
        res.status(200).json({books});  
    })
    
});

//count books by category
router.get('/countby/category', (req, res, next) => {
        Book.aggregate([
        {$unwind: "$category"},
        {$group: {_id: "$category", count: {$sum: 1}}}
    ]).exec((err, result) => {
        if(err) return next(err);
       res.status(200).json({result});
    })
});

//list book by author
router.get('/filter/byauthor', (req, res, next) => {
    Book.aggregate([
        {$group: {
            _id: "$author", 
            "books": {
                $push: "$$ROOT"
        }}
    }

    ]).exec((err, result) => {
        if(err) return next(err);
        res.status(200).json({result});
    })
});

//add tags to books
router.put('/:id/addtags', (req, res, next) => {
    let id = req.params.id;
    req.body.tags = req.body.tags.trim().split(" ");
    Book.findByIdAndUpdate(id, req.body, (err, book) => {
        if(err) return next(err);
        res.status(200).json({book});
    })
})

//list all tags in ascending order
router.get('/filter/tags', (req, res, next) => {
    Book.aggregate([
        {$unwind: '$tags'},
        {$sort: {'tags': 1}}
    ]).exec((err, result) => {
        if(err) return next(err);
        res.status(200).json({result});
    })
    
});

//filter books by tags
router.get('/list/tags/', (req, res, next) => {
    Book.aggregate([
        {$unwind: "$tags"}
    ]).exec((err, result) => {
        if(err) return next(err);
        res.status(200).json({result});
    })
});

router.get('/countby/tags', (req, res, next) => {
    Book.aggregate([
        {$unwind: "$tags"},
        {$group: {_id: "$tags", count: {$sum: 1}}}
    ]).exec((err, result) => {
        if(err) return next(err);
       res.status(200).json({result});
    })
});
module.exports = router;
