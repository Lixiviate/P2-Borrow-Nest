const router = require('express').Router();
const { User, Book, Holder } = require('../models');
const withAuth = require('../utils/auth');

// GET all books for homepage
router.get('/', async (req, res) => {
  try {
    const dbBookData = await Book.findAll({
      include: [
        {
          model: User,
          as: 'user', // Owner of the book
          attributes: ['username'],
        },
        {
          model: Holder,
          include: [
            {
              model: User,
              attributes: ['username'], // Username of the holder
            },
          ],
        },
      ],
    });

    const books = dbBookData.map((book) => book.get({ plain: true }));

    const justLoggedIn = req.session.justLoggedIn || false;

    req.session.justLoggedIn = false;

    res.render('homepage', {
      books,
      loggedIn: req.session.loggedIn,
      justLoggedIn,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET login page
router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
    return;
  }
  res.render('login');
});

// GET signup page
router.get('/signup', (req, res) => {
  // If user is logged in, redirect to homepage
  if (req.session.loggedIn) {
    res.redirect('/');
    return;
  }
  // Render signup page
  res.render('signup');
});

router.get('/dashboard', withAuth, (req, res) => {
  res.render('dashboard', {
    loggedIn: req.session.loggedIn,
  });
});

module.exports = router;
