require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key', // Gunakan environment variable
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Gunakan secure cookies di production
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user; // Make user data available to all views
    next();
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use(routes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: err });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});