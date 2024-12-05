'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const data = require("../post.json").map((el)=>{
      delete el.id
      el.createdAt = el.updatedAt = new Date()
      return el
   })
   await queryInterface.bulkInsert("Posts", data, {})
 },

 async down (queryInterface, Sequelize) {
   /**
    * Add commands to revert seed here.
    *
    * Example:
    * await queryInterface.bulkDelete('People', null, {});
    */
   await queryInterface.bulkDelete("Posts", null, {})
 }
};