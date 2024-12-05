'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.User, { foreignKey: 'userId' })
      Post.belongsToMany(models.Tag, { through: "PostTag", foreignKey: 'postId' })
    }

    // Getters
    get formattedDate() {
      return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    get contentPreview() {
      // First remove HTML tags
      const cleanContent = this.content.replace(/<[^>]*>/g, '');
      // Then remove extra whitespace
      const trimmedContent = cleanContent.replace(/\s+/g, ' ').trim();
      // Then create preview
      return trimmedContent.length > 150
        ? trimmedContent.substring(0, 150) + '...'
        : trimmedContent;
    }

    get readTime() {
      // Remove HTML tags first for accurate word count
      const cleanContent = this.content.replace(/<[^>]*>/g, '');
      const wordsPerMinute = 200;
      const words = cleanContent.trim().split(/\s+/).length;
      const readTime = Math.ceil(words / wordsPerMinute);
      return `${readTime} min read`;
    }

    // Instance Methods
    async addTags(tagNames) {
      const { Tag, PostTag } = sequelize.models;
      const tagPromises = tagNames.map(name => 
        Tag.findOrCreate({
          where: { name: name.toLowerCase().trim() }
        })
      );
      const tags = await Promise.all(tagPromises);
      const tagInstances = tags.map(tag => tag[0]);
      await this.setTags(tagInstances);
      return tagInstances;
    }

    async updateTags(tagNames) {
      await this.removeTags(); // Clear existing tags
      return await this.addTags(tagNames);
    }

    async removeTags() {
      const { PostTag } = sequelize.models;
      await PostTag.destroy({
        where: { postId: this.id }
      });
    }

    isOwnedBy(userId) {
      return this.userId === userId;
    }

    toJSON() {
      const values = { ...this.get() };
      return {
        ...values,
        formattedDate: this.formattedDate,
        contentPreview: this.contentPreview,
        readTime: this.readTime
      };
    }
  }

  Post.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Title is required"
        }
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Content is required"
        },
        notOnlyHTML(value) {

          const cleanContent = value.replace(/<[^>]*>/g, '').trim();
          if (!cleanContent) {
            throw new Error('Content cannot be empty');
          }
        }
      }
    },
    imgUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Post',
  });

  return Post;
};