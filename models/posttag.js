'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class postTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  postTag.init({
    postId: { type: DataTypes.INTEGER, allowNull: false },
      tagId: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    sequelize,
    modelName: 'postTag',
  });
  return postTag;
};