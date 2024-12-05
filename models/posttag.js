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
                model: 'Posts', 
                key: 'id'        
            }
        },
        tagId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Tags',   
                key: 'id'        
            }
        }
    }, {
        sequelize,
        modelName: 'PostTag',
        tableName: 'PostTags'
    });
    return PostTag;
};