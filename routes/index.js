const express = require('express');
const router = express.Router();
const Controller = require('../controllers/controller');
const { isLoggedIn } = require('../middlewares/auth.js');

// Home & Auth routes
router.get('/', Controller.home);
router.get('/register', Controller.registerForm);
router.post('/register', Controller.register);
router.get('/login', Controller.loginForm);
router.post('/login', Controller.login);
router.get('/logout', Controller.logout);

// Post routes
router.get('/posts', Controller.getAllPosts);
router.get('/posts/new', isLoggedIn, Controller.createPostForm);
router.post('/posts', isLoggedIn, Controller.createPost);
router.get('/posts/:id', Controller.getPostById);
router.get('/posts/:id/edit', isLoggedIn, Controller.editPostForm);
router.post('/posts/:id/edit', isLoggedIn, Controller.updatePost);
router.get('/posts/:id/delete', isLoggedIn, Controller.deletePost);

// Profile routes
router.get('/profile', isLoggedIn, Controller.getProfile);
router.post('/profile', isLoggedIn, Controller.updateProfile);

module.exports = router;