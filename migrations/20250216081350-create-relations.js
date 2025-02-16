'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.addColumn("courses", "book_collection_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "books",
          key: "id",
        },

        onDelete: "CASCADE",
      });

      await queryInterface.addColumn("courses", "teacher", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      });

      await queryInterface.addColumn("courses", "level_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "levels",
          key: "id",
        },
      });

      await queryInterface.addColumn("sales", "course_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "courses",
          key: "id",
        },
      });

      await queryInterface.addColumn("sales", "user_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      });

      await queryInterface.addColumn("files", "book_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "books",
          key: "id",
        },
      });

      await queryInterface.addColumn("articles", "author", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      });

      await queryInterface.addColumn("freebooks", "level_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "levels",
          key: "id",
        },
      });

      await queryInterface.addColumn("q4gamequestions", "q4game_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "q4games",
          key: "id",
        },

        onDelete: "CASCADE",
      });

      await queryInterface.addColumn("medaiGameQuestions", "mediagame_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "mediagames",
          key: "id",
        },

        onDelete: "CASCADE",
      });

      await queryInterface.addColumn("users", "role_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: "roles",
          key: "id",
        },
      });

      await queryInterface.addColumn("users", "level_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: "levels",
          key: "id",
        },
      });

      await queryInterface.addColumn("sessions", "course_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "courses",
          key: "id",
        },

        onDelete: "CASCADE",
      });

      await queryInterface.addColumn("sessions", "q4game_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: "q4games",
          key: "id",
        },
      });

      await queryInterface.addColumn("sessions", "mediagame_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: "mediagames",
          key: "id",
        },
      });

      await queryInterface.addColumn("sessions", "phrasegame_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: "phrasegames",
          key: "id",
        },
      });

      await queryInterface.addColumn("userSessiongames", "session_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "sessions",
          key: "id",
        },

        onDelete: "CASCADE",
      });

      await queryInterface.addColumn("userSessiongames", "user_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },

        onDelete: "CASCADE",
      });

      await queryInterface.addColumn("offs", "course_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "courses",
          key: "id",
        },
      });

      await queryInterface.addColumn("offs", "creator_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      });



      await queryInterface.createTable("tags_courses", {
        course_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "courses",
            key: "id",
          },

          onDelete: "CASCADE",
        },

        tag_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "tags",
            key: "id",
          },

          onDelete: "CASCADE",
        },
      });

      await queryInterface.createTable("tags_articles", {
        article_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "articles",
            key: "id",
          },

          onDelete: "CASCADE",
        },

        tag_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "tags",
            key: "id",
          },

          onDelete: "CASCADE",
        },
      });

      await queryInterface.createTable("tags_books", {
        book_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "books",
            key: "id",
          },

          onDelete: "CASCADE",
        },

        tag_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "tags",
            key: "id",
          },

          onDelete: "CASCADE",
        },
      });

      await queryInterface.createTable("tags_freebooks", {
        freebook_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "freebooks",
            key: "id",
          },

          onDelete: "CASCADE",
        },

        tag_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "tags",
            key: "id",
          },

          onDelete: "CASCADE",
        },
      });

      await queryInterface.createTable("users_courses", {
        course_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "courses",
            key: "id",
          },

          onDelete: "CASCADE",
        },

        user_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "CASCADE",
        },
      });


      await queryInterface.createTable("offs_users", {
        off_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "offs",
            key: "id",
          },

          onDelete: "CASCADE",
        },

        user_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },

          onDelete: "CASCADE",
        },

        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue : Sequelize.NOW
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue : Sequelize.NOW
        }
      });

      // await queryInterface.createTable("levels_courses", {
      //   course_id: {
      //     type: Sequelize.INTEGER.UNSIGNED,
      //     allowNull: false,
      //     references: {
      //       model: "courses",
      //       key: "id",
      //     },

      //     onDelete: "CASCADE",
      //   },

      //   level_id: {
      //     type: Sequelize.INTEGER.UNSIGNED,
      //     allowNull: false,
      //     references: {
      //       model: "levels",
      //       key: "id",
      //     },

      //     onDelete: "CASCADE",
      //   },
      // });

      await queryInterface.addConstraint("tags_courses", {
        fields: ["course_id", "tag_id"],
        type: "unique",
        name: "unique_course_tag",
      });

      await queryInterface.addConstraint("tags_articles", {
        fields: ["article_id", "tag_id"],
        type: "unique",
        name: "unique_article_tag",
      });

      await queryInterface.addConstraint("tags_books", {
        fields: ["book_id", "tag_id"],
        type: "unique",
        name: "unique_book_tag",
      });

      await queryInterface.addConstraint("tags_freebooks", {
        fields: ["freebook_id", "tag_id"],
        type: "unique",
        name: "unique_freebook_tag",
      });

      await queryInterface.addConstraint("users_courses", {
        fields: ["course_id", "user_id"],
        type: "unique",
        name: "unique_user_course",
      });

      await queryInterface.addConstraint("offs_users", {
        fields: ["off_id", "user_id"],
        type: "unique",
        name: "unique_user_off",
      });

      // await queryInterface.addConstraint("levels_courses", {
      //   fields: ["course_id", "level_id"],
      //   type: "unique",
      //   name: "unique_level_course",
      // });



      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeColumn("courses", "book_collection_id");
      await queryInterface.removeColumn("courses", "teacher");
      await queryInterface.removeColumn("courses", "level_id");
      await queryInterface.removeColumn("sales", "course_id");
      await queryInterface.removeColumn("sales", "user_id");
      await queryInterface.removeColumn("files", "book_id");
      await queryInterface.removeColumn("articles", "author");
      await queryInterface.removeColumn("q4gamequestions", "q4game_id");
      await queryInterface.removeColumn("medaiGameQuestions", "mediagame_id");
      await queryInterface.removeColumn("users", "role_id");
      await queryInterface.removeColumn("users", "level_id");
      await queryInterface.removeColumn("sessions", "course_id");
      await queryInterface.removeColumn("sessions", "q4game_id");
      await queryInterface.removeColumn("sessions", "mediagame_id");
      await queryInterface.removeColumn("sessions", "phrasegame_id");
      await queryInterface.removeColumn("userSessiongames", "session_id");
      await queryInterface.removeColumn("offs", "creator_id");
      await queryInterface.removeColumn("offs", "course_id");


      await queryInterface.dropTable("tags_courses");
      await queryInterface.dropTable("tags_articles");
      await queryInterface.dropTable("tags_books");
      await queryInterface.dropTable("tags_freebooks");
      await queryInterface.dropTable("users_courses");
      await queryInterface.dropTable("levels_courses");
      await queryInterface.dropTable("offs_users");


      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    await queryInterface.dropTable("relations");
  }
};