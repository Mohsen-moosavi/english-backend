const OffUsers = (sequelize) =>
  sequelize.define(
    "offs_users",
    {},
    {
      tableName: "offs_users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = OffUsers;