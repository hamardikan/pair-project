const { User, Profile, Post, Tag, PostTag } = require('../models');
const Helper = require("../helpers/index.js");
const { Op } = require('sequelize');

class Controller {
    static handleError(res, error, redirectUrl = '/') {
        console.error('Error:', error);
        
        if (redirectUrl.includes('/edit')) {
            const id = redirectUrl.split('/')[2];
            Post.findOne({
                where: { id },
                include: [Tag]
            }).then(post => {
                if (!post) {
                    return res.redirect('/posts?error=' + encodeURIComponent('Post not found'));
                }
                
                res.render('posts/edit', {
                    post,
                    error: error.message,
                    formData: req.body
                });
            }).catch(err => {
                res.redirect('/posts?error=' + encodeURIComponent(err.message));
            });
        } else {
            res.redirect(`${redirectUrl}?error=${encodeURIComponent(error.message)}`);
        }
    }

    static async home(req, res) {
        try {
            const posts = await Post.findAll({
                include: [
                    { model: User, include: [Profile] },
                    { model: Tag }
                ],
                order: [['createdAt', 'DESC']],
                limit: 6
            });
            res.render('index', { posts, Helper });
        } catch (error) {
            Controller.handleError(res, error);
        }
    }

    // Auth Controllers
    static registerForm(req, res) {
        const { error } = req.query;
        res.render('auth/register', { error });
    }

    static async register(req, res) {
        try {
            const { username, email, password } = req.body;
            const user = await User.create({ username, email, password, role: 'user' });
            await user.createEmptyProfile();
            res.redirect('/login?success=Registration successful');
        } catch (error) {
            Controller.handleError(res, error, '/register');
        }
    }

    static loginForm(req, res) {
        const { error, success } = req.query;
        res.render('auth/login', { error, success });
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({
                where: { email },
                include: [Profile]
            });

            if (!user || !User.validatePassword(password, user.password)) {
                throw new Error('Invalid email/password');
            }

            req.session.userId = user.id;
            req.session.role = user.role;
            req.session.user = user.profileData;

            res.redirect('/');
        } catch (error) {
            Controller.handleError(res, error, '/login');
        }
    }

    static logout(req, res) {
        req.session.destroy(err => {
            if (err) console.error('Logout error:', err);
            res.redirect('/');
        });
    }

    // Post Controllers
    static async getAllPosts(req, res) {
        try {
            const posts = await Post.findAll({
                include: [
                    { model: User, include: [Profile] },
                    { model: Tag }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.render('posts/show', { posts, Helper, currentTag: null });
        } catch (error) {
            Controller.handleError(res, error);
        }
    }

    static async getPostDetail(req, res) {
        try {
            const { id } = req.params;
            const post = await Post.findOne({
                where: { id },
                include: [
                    { model: User, include: [Profile] },
                    { model: Tag }
                ]
            });

            if (!post) throw new Error('Post not found');
            res.render('posts/detail', { post, Helper });
        } catch (error) {
            Controller.handleError(res, error, '/posts');
        }
    }

    static async getPostsByTag(req, res) {
        try {
            const { tagName } = req.params;
            const tag = await Tag.findOne({
                where: { name: tagName.toLowerCase() }
            });

            if (!tag) throw new Error('Tag not found');

            const posts = await Post.findAll({
                include: [
                    { model: User, include: [Profile] },
                    { model: Tag, where: { id: tag.id } }
                ],
                order: [['createdAt', 'DESC']]
            });

            res.render('posts/show', { posts, Helper, currentTag: tagName });
        } catch (error) {
            Controller.handleError(res, error, '/posts');
        }
    }

    static createPostForm(req, res) {
        const { error } = req.query;
        res.render('posts/create', { error, Helper });
    }

    static async createPost(req, res) {
        try {
          const { title, content, tags, imgUrl } = req.body;
          const userId = req.session.userId;
      
          const errors = {};
          
          if (!title || !title.trim()) {
            errors.title = 'Title is required';
          }
          
          if (!content || content.trim() === '<p><br></p>') {
            errors.content = 'Content is required';
          }
          
          if (imgUrl && !Helper.isValidUrl(imgUrl)) {
            errors.imgUrl = 'Please enter a valid URL';
          }
      
          if (Object.keys(errors).length > 0) {
            return res.render('posts/new', {
              error: 'Please correct the validation errors',
              errors,
              formData: req.body
            });
          }
      
        
          const post = await Post.create({
            title, 
            content, 
            imgUrl, 
            userId
          });
      
          if (tags) {
            await post.addTags(tags.split(','));
          }
      
          res.redirect('/posts');
        } catch (error) {
          Controller.handleError(res, error, '/posts/new');
        }
      }
      
      static handleError(res, error, redirectUrl = '/') {
        console.error('Error:', error);
        return res.render('posts/new', {
          error: error.message,
          formData: req.body // Send back the form data to repopulate the form
        });
      }
      

    static async editPostForm(req, res) {
        try {
            const { id } = req.params;
            const post = await Post.findOne({
                where: { id },
                include: [Tag]
            });

            if (!post) throw new Error('Post not found');
            if (!post.isOwnedBy(req.session.userId)) {
                throw new Error('Unauthorized access');
            }

            res.render('posts/edit', { post, Helper });
        } catch (error) {
            Controller.handleError(res, error, '/posts');
        }
    }

    static async updatePost(req, res) {
        try {
            const { id } = req.params;
            const { title, content, tags, imgUrl } = req.body;
            
            const errors = {};
            
            if (!title || !title.trim()) {
                errors.title = 'Title is required';
            }
            
            if (!content || content.trim() === '<p><br></p>') {
                errors.content = 'Content is required';
            }
            
            if (imgUrl && !Helper.isValidUrl(imgUrl)) {
                errors.imgUrl = 'Please enter a valid URL';
            }
    
            if (Object.keys(errors).length > 0) {
                const post = await Post.findOne({
                    where: { id },
                    include: [Tag]
                });
                
                return res.render('posts/edit', {
                    post,
                    error: 'Please correct the validation errors',
                    errors,
                    formData: req.body 
                });
            }
    
            const post = await Post.findOne({
                where: { id },
                include: [Tag]
            });
    
            if (!post) throw new Error('Post not found');
            
            if (!post.isOwnedBy(req.session.userId)) {
                throw new Error('Unauthorized access');
            }
    
            await post.update({
                title,
                content,
                imgUrl: imgUrl || null
            });
    
            if (tags) {
                await post.updateTags(tags.split(','));
            }
    
            res.redirect(`/posts/${id}`);
        } catch (error) {
            Controller.handleError(res, error, `/posts/${req.params.id}/edit`);
        }
    }

    static async deletePost(req, res) {
        try {
            const { id } = req.params;
            const post = await Post.findByPk(id);
    
            if (!post) {
                throw new Error('Post not found');
            }
    
            if (req.session.user.role !== 'admin' && post.userId !== req.session.user.id) {
                throw new Error('You are not authorized to delete this post');
            }
    
            await PostTag.destroy({
                where: { postId: post.id }
            });
    
            await post.destroy();
    
            res.redirect('/posts?success=Post deleted successfully');
        } catch (error) {
            res.redirect('/posts?error=' + error.message);
        }
    }

    // Profile Controllers
    static async getProfile(req, res) {
        try {
            const user = await User.findOne({
                where: { id: req.session.userId },
                include: [Profile]
            });

            if (!user.Profile) {
                await user.createEmptyProfile();
                const updatedUser = await User.findOne({
                    where: { id: req.session.userId },
                    include: [Profile]
                });
                return res.render('posts/profile', { user: updatedUser, Helper });
            }

            res.render('posts/profile', { user, Helper });
        } catch (error) {
            Controller.handleError(res, error);
        }
    }

    static async updateProfile(req, res) {
        try {
            let profile = await Profile.findOne({
                where: { userId: req.session.userId }
            });

            if (!profile) {
                profile = await Profile.create({
                    userId: req.session.userId,
                    ...req.body
                });
            } else {
                await profile.updateProfileData(req.body);
            }

            const updatedUser = await User.findOne({
                where: { id: req.session.userId },
                include: [Profile]
            });
            req.session.user = updatedUser.profileData;

            res.redirect('/profile?success=Profile updated successfully');
        } catch (error) {
            Controller.handleError(res, error, '/profile');
        }
    }
}

module.exports = Controller;