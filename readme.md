## 1 Menginstall dependencies
```
npm install express pg pg-hstore sequelize
npm install ejs
npm install bcryptjs
npm install express-session
npm install dotenv
npm install multer           # untuk upload gambar
```

Development dependencies :
```
npm install -D sequelize-cli nodemon
```

buat foler yang dibutuhkan
```
mkdir views
mkdir views/partials
mkdir views/posts
mkdir views/auth
mkdir controllers
mkdir middlewares
mkdir helpers
mkdir routes
```

Buat app.js
```js
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
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

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
```