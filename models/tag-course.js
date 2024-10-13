const TagCourses = (sequelize) =>
  sequelize.define(
    "tags_courses",
    {},
    {
      tableName: "tags_courses"
    }
  );

module.exports = TagCourses;