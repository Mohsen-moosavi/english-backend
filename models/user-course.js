const UserCourses = (sequelize) =>
  sequelize.define(
    "users_courses",
    {},
    {
      tableName: "users_courses"
    }
  );

module.exports = UserCourses;