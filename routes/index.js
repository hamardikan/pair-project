const express = require('express');
const router = express.Router();
const Controller = require('../controllers/controller');
const { isLoggedIn, isNotLoggedIn, isAdmin } = require('../middlewares/auth.js');

// Home & Auth routes
router.get('/', Controller.home);
router.get('/register', isNotLoggedIn, Controller.registerForm);
router.post('/register', isNotLoggedIn, Controller.register);
router.get('/login', isNotLoggedIn, Controller.loginForm);
router.post('/login', isNotLoggedIn, Controller.login);
router.post('/logout', isLoggedIn, Controller.logout);
router.get('/admin', isAdmin, Controller.admin)

// Post routes
router.get('/posts', Controller.getAllPosts);
router.get('/posts/new', isLoggedIn, Controller.createPostForm);
router.post('/posts', isLoggedIn, Controller.createPost);
router.get('/posts/:id', Controller.getPostDetail);
router.get('/tags/:tagName', Controller.getPostsByTag);
router.get('/posts/:id/edit', isLoggedIn, Controller.editPostForm);
router.post('/posts/:id/edit', isLoggedIn, Controller.updatePost);
router.get('/posts/:id/delete', isLoggedIn, Controller.deletePost);

// Profile routes
router.get('/profile', isLoggedIn, Controller.getProfile);
router.post('/profile', isLoggedIn, Controller.updateProfile);

module.exports = router;