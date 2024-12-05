'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Tag extends Model {
        static associate(models) {
            Tag.belongsToMany(models.Post, { through: "PostTag", foreignKey: 'tagId' })
        }

        static async findOrCreateByName(name) {
            return await Tag.findOrCreate({
                where: { name: name.toLowerCase().trim() }
            });
        }
    }
    Tag.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Tag name is required"
                }
            }
        }
    }, {
        sequelize,
        modelName: 'Tag',
    });
    return Tag;
};