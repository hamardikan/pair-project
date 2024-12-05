'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Profile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  Profile.init({
    fullName: DataTypes.STRING,
      bio: DataTypes.TEXT,
      avatarUrl: DataTypes.STRING,
      location: DataTypes.STRING,
      birthDate: DataTypes.DATE,
      userId: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    sequelize,
    modelName: 'Profile',
    tableName: 'Profiles',
  });
  return Profile;
};