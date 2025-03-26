const UserCourses = (sequelize) =>
  sequelize.define(
    "users_courses",
    {},
    {
      tableName: "users_courses",
      timestamps : false
    }
  );

module.exports = UserCourses;