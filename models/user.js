'use strict';
const bcrypt = require('bcryptjs');

const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasOne(models.Profile, { foreignKey: 'userId' });
            User.hasMany(models.Post, { foreignKey: 'userId' });
        }

        isValidPassword(password) {
            return bcrypt.compareSync(password, this.password);
        }

        getSessionData() {
            return {
                userId: this.id,
                role: this.role,
                user: {
                    id: this.id,
                    username: this.username,
                    email: this.email,
                    role: this.role,
                    profile: this.Profile?.toJSON()
                }
            };
        }

        static scope() {
            return {
                withProfile: {
                    include: [Profile]
                }
            };
        }

        static validatePassword(password, hashedPassword) {
            return bcrypt.compareSync(password, hashedPassword);
          }
          
          async createEmptyProfile() {
            const { Profile } = require('../models');
            return await Profile.create({
              userId: this.id,
              fullName: '',
              bio: '',
              location: ''
            });
          }
          
          get profileData() {
            return {
              id: this.id,
              username: this.username,
              email: this.email,
              role: this.role,
              profile: this.Profile
            };
          }
    }
    User.init({
        username: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: "Must be valid email format!"
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [8],
                    msg: "Password must be at least 8 characters"
                }
            }
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        hooks: {
            beforeCreate: (user) => {
                const salt = bcrypt.genSaltSync(10);
                user.password = bcrypt.hashSync(user.password, salt);
            }
        },
        sequelize,
        modelName: 'User',
    });
    return User;
};