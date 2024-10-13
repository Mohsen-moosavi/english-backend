const TagsBooks = (sequelize) =>
  sequelize.define(
    "tags_Books",
    {},
    {
      tableName: "tags_books",
      timestamps: false
    }
  );

module.exports = TagsBooks;