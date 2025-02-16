const TagCourses = (sequelize) =>
  sequelize.define(
    "tags_courses",
    {},
    {
      tableName: "tags_courses",
      timestamps: false,
    }
  );

module.exports = TagCourses;