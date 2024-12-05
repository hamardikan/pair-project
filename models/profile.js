'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    static associate(models) {
      Profile.belongsTo(models.User, { foreignKey: 'userId'})
    }

    async updateProfileData(data) {
        const { fullName, bio, location, avatarUrl } = data;
        await this.update({
          fullName,
          bio,
          location,
          avatarUrl
        });
      }
  }
  Profile.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Profile',
  });
  return Profile;
};