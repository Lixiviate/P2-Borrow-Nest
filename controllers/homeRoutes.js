const router = require('express').Router();
const { User, Book, Holder, Wishlist } = require('../models');
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
      pageTitle: 'Home',
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
  res.render('login', {
    pageTitle: 'Login',
  });
});

// GET signup page
router.get('/signup', (req, res) => {
  // If user is logged in, redirect to homepage
  if (req.session.loggedIn) {
    res.redirect('/');
    return;
  }
  // Render signup page
  res.render('signup', {
    pageTitle: 'Signup',
  });
});

router.get('/dashboard', withAuth, (req, res) => {
  res.render('dashboard', {
    pageTitle: 'Dashboard',
    loggedIn: req.session.loggedIn,
  });
});

// GET profile page with user's books and wishlist
router.get('/profile', withAuth, async (req, res) => {
  try {
    const userBookData = await Book.findAll({
      where: {
        user_id: req.session.user_id,
      },
    });

    if (!userBookData) {
      res.status(404).json({ message: 'User does not have any books.' });
      return;
    }

    const userBooks = userBookData.map((book) => book.get({ plain: true }));

    // Fetch the user's wishlist
    const wishlistData = await Wishlist.findAll({
      where: {
        user_id: req.session.user_id,
      },
      include: [{ model: Book }],
    });

    const wishlistItems = wishlistData.map((item) => item.get({ plain: true }));

    // Render profile with books and wishlist
    res.render('profile', {
      pageTitle: 'Profile',
      books: userBooks,
      wishlist: wishlistItems,
      loggedIn: req.session.loggedIn,
      username: req.session.username,
      email: req.session.email,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET all users (exclude passwords)
router.get('/users', async (req, res) => {
  const response = await User.findAll({
    attributes: {
      exclude: ['password'],
    },
  });
  res.json(response);
});

// GET all books
router.get('/books', async (req, res) => {
  const response = await Book.findAll({});
  res.json(response);
});

module.exports = router;
