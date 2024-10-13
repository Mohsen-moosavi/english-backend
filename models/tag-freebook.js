const TagFreebooks = (sequelize) =>
  sequelize.define(
    "tags_freebooks",
    {},
    {
      tableName: "tags_freebooks"
    }
  );

module.exports = TagFreebooks;