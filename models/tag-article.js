const TagArticles = (sequelize) =>
  sequelize.define(
    "tags_article",
    {},
    {
      tableName: "tags_articles",
      timestamps: false,
    }
  );

module.exports = TagArticles;