const { User, Profile, Post, Tag, PostTag } = require('../models');
const bcrypt = require('bcryptjs');
const Helper = require("../helpers/index.js")

class Controller {
    // Home
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
            res.render('index', { posts , Helper});
        } catch (error) {
            res.render('error', { error });
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
            await User.create({
                username,
                email,
                password,
                role: 'user'
            });
            res.redirect('/login?success=Registration successful');
        } catch (error) {
            res.redirect(`/register?error=${error.message}`);
        }
    }

    static loginForm(req, res) {
        const { error, success } = req.query;
        res.render('auth/login', { error, success });
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });
            
            if (!user) {
                throw new Error('Invalid email/password');
            }
            
            const isValidPassword = bcrypt.compareSync(password, user.password);
            if (!isValidPassword) {
                throw new Error('Invalid email/password');
            }
    
            // Set session data
            req.session.userId = user.id;
            req.session.role = user.role;
            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            };
    
            res.redirect('/');
        } catch (error) {
            res.redirect(`/login?error=${error.message}`);
        }
    }

    static logout(req, res) {
        req.session.destroy(err => {
            if (err) console.log(err);
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
            res.render('posts/show', { posts, Helper });
        } catch (error) {
            res.render('error', { error });
        }
    }

    static createPostForm(req, res) {
        res.render('posts/create');
    }

    static async createPost(req, res) {
        try {
            const { title, content, tags } = req.body;
            // content disini sudah dalam format HTML dari Quill.js
            const userId = req.session.userId;

            const post = await Post.create({
                title,
                content, // HTML content dari Quill
                userId
            });

            if (tags) {
                const tagArray = tags.split(',').map(tag => tag.trim());
                for (const tagName of tagArray) {
                    const [tag] = await Tag.findOrCreate({
                        where: { name: tagName }
                    });
                    await PostTag.create({
                        postId: post.id,
                        tagId: tag.id
                    });
                }
            }

            res.redirect('/posts');
        } catch (error) {
            res.render('error', { error });
        }
    }

    // Profile Controllers
    static async getProfile(req, res) {
        try {
            const user = await User.findOne({
                where: { id: req.session.userId },
                include: Profile
            });
            res.render('profile', { user });
        } catch (error) {
            res.render('error', { error });
        }
    }

    static async updateProfile(req, res) {
        try {
            const { fullName, bio, location } = req.body;
            await Profile.update({
                fullName,
                bio,
                location
            }, {
                where: { userId: req.session.userId }
            });
            res.redirect('/profile?success=Profile updated');
        } catch (error) {
            res.redirect(`/profile?error=${error.message}`);
        }
    }

    static async getPostById(req, res) {
        try {
            const { id } = req.params;
            const post = await Post.findOne({
                where: { id },
                include: [
                    {
                        model: User,
                        include: [Profile]
                    },
                    { model: Tag }
                ]
            });

            if (!post) {
                throw new Error('Post not found');
            }

            res.render('posts/show', { post });
        } catch (error) {
            res.render('error', { error: error.message });
        }
    }

    static async editPostForm(req, res) {
        try {
            const { id } = req.params;
            const post = await Post.findOne({
                where: { id },
                include: [Tag]
            });

            if (!post) {
                throw new Error('Post not found');
            }

            // Check if user is the author
            if (post.userId !== req.session.userId) {
                throw new Error('You are not authorized to edit this post');
            }

            res.render('posts/edit', { post });
        } catch (error) {
            res.redirect(`/posts?error=${error.message}`);
        }
    }

    static async updatePost(req, res) {
        try {
            const { id } = req.params;
            const { title, content, tags } = req.body;

            const post = await Post.findOne({
                where: { id },
                include: [Tag]
            });

            if (!post) {
                throw new Error('Post not found');
            }

            // Check if user is the author
            if (post.userId !== req.session.userId) {
                throw new Error('You are not authorized to edit this post');
            }

            // Update post
            await post.update({
                title,
                content
            });

            // Handle tags update
            if (tags) {
                // Remove old tags
                await PostTag.destroy({
                    where: { postId: post.id }
                });

                // Add new tags
                const tagArray = tags.split(',').map(tag => tag.trim());
                for (const tagName of tagArray) {
                    const [tag] = await Tag.findOrCreate({
                        where: { name: tagName }
                    });
                    await PostTag.create({
                        postId: post.id,
                        tagId: tag.id
                    });
                }
            }

            res.redirect(`/posts/${id}`);
        } catch (error) {
            res.redirect(`/posts/${id}/edit?error=${error.message}`);
        }
    }

    static async deletePost(req, res) {
        try {
            const { id } = req.params;
            const post = await Post.findByPk(id);

            if (!post) {
                throw new Error('Post not found');
            }

            // Check if user is the author
            if (post.userId !== req.session.userId) {
                throw new Error('You are not authorized to delete this post');
            }

            // Delete associated tags
            await PostTag.destroy({
                where: { postId: post.id }
            });

            // Delete the post
            await post.destroy();

            res.redirect('/posts?success=Post deleted successfully');
        } catch (error) {
            res.redirect('/posts?error=' + error.message);
        }
    }
}

module.exports = Controller;