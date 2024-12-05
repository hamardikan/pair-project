'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class PostTag extends Model {
        static associate(models) {
            // junction table doesn't need associations
        }
    }
    PostTag.init({
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Posts',  // name of the referenced table
                key: 'id'        // referenced column
            }
        },
        tagId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Tags',   // name of the referenced table
                key: 'id'        // referenced column
            }
        }
    }, {
        sequelize,
        modelName: 'PostTag',
        tableName: 'PostTags'
    });
    return PostTag;
};