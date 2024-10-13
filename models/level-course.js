const LevelsCourses = (sequelize) =>
    sequelize.define(
      "levels_courses",
      {},
      {
        tableName: "levels_courses"
      }
    );
  
  module.exports = LevelsCourses;