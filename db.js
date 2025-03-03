const { Sequelize } = require("sequelize");
const configs = require("./configs");

const db = new Sequelize({
    host: configs.db.host,
    port: configs.db.port,
    username: configs.db.user,
    password: configs.db.password,
    database: configs.db.name,
    dialect: configs.db.dialect,
    logging: configs.isProduction ? false : console.log,
  });

//* JsDoc
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const Article = require("./models/article")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const Book = require("./models/book")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const Course = require("./models/courses")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const Ban = require("./models/ban")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const FreeBook = require("./models/freebook")(db);
// /** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
// const LevelCourse = require("./models/level-course")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const Level = require("./models/level")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const MedaiGameQuestion = require("./models/medaigamequestion")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const MedaiGame = require("./models/mediagame")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const PhraseGame = require("./models/phrasegame")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const Q4game = require("./models/q4game")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const q4gameQuestion = require("./models/q4gamequestions")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const Role = require("./models/role")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const Session = require("./models/session")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const TagArticles = require("./models/tag-article")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const TagBooks = require("./models/tag-book")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const TagCourses = require("./models/tag-course")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const TagFreebooks = require("./models/tag-freebook")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const Tag = require("./models/tag")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const UserCourses = require("./models/user-course")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const User = require("./models/user")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const UserSessionGames = require("./models/usersessiongame")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const File = require("./models/file")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const Sale = require("./models/sale")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const Off = require("./models/off")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const OffUsers = require("./models/off-user")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const Comment = require("./models/comment")(db);


Book.hasMany(Course, {
    foreignKey: "book_collection_id",
    onDelete: "CASCADE",
  });
  
Course.belongsTo(Book, { foreignKey: "book_collection_id", as: "book_collection" });


User.hasMany(Course, {
    foreignKey: "teacher"
  });
  
Course.belongsTo(User, { foreignKey: "teacher" });


User.hasMany(Article, {
  foreignKey: "author"
});

Article.belongsTo(User, { foreignKey: "author" });


User.hasMany(Sale, {
  foreignKey: "user_id"
});

Sale.belongsTo(User, { foreignKey: "user_id" });


User.hasMany(Comment, {
  foreignKey: "user_id"
});

Comment.belongsTo(User, { foreignKey: "user_id" });


Comment.hasMany(Comment, {
  foreignKey: "parent_id",
  as : 'replies',
  onDelete:'CASCADE'
});

Comment.belongsTo(Comment, { foreignKey: "parent_id", as:'parent' , onDelete:'CASCADE' });


Course.hasMany(Comment, {
  foreignKey: "course_id"
});

Comment.belongsTo(Course, { foreignKey: "course_id" });


Course.hasMany(Sale, {
  foreignKey: "course_id"
});

Sale.belongsTo(Course, { foreignKey: "course_id" });


Book.hasMany(File, {
  foreignKey: "book_id"
});

File.belongsTo(Book, { foreignKey: "book_id" });

Level.hasMany(Course, {
    foreignKey: "level_id"
  });
  
Course.belongsTo(Level, { foreignKey: "level_id", as: "level" });


Q4game.hasMany(q4gameQuestion, {
    foreignKey: "q4game_id"
  });
  
q4gameQuestion.belongsTo(Q4game, { foreignKey: "q4game_id", as: "q4game" });


MedaiGame.hasMany(MedaiGameQuestion, {
    foreignKey: "mediagame_id"
  });
  
MedaiGameQuestion.belongsTo(MedaiGame, { foreignKey: "mediagame_id", as: "mediagame" });


Role.hasMany(User, {
    foreignKey: "role_id"
  });
  
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });


Level.hasMany(User, {
    foreignKey: "level_id"
  });
  
User.belongsTo(Level, { foreignKey: "level_id", as: "level" });

Level.hasMany(FreeBook, {
  foreignKey: "level_id"
});

FreeBook.belongsTo(Level, { foreignKey: "level_id", as: "level" });


Course.hasMany(Session, {
    foreignKey: "course_id"
  });
  
Session.belongsTo(Course, { foreignKey: "course_id", as: "course" });


Q4game.hasMany(Session, {
    foreignKey: "q4game_id"
  });
  
Session.belongsTo(Q4game, { foreignKey: "q4game_id", as: "q4game" });


MedaiGame.hasMany(Session, {
    foreignKey: "mediagame_id"
  });
  
Session.belongsTo(MedaiGame, { foreignKey: "mediagame_id", as: "mediagame" });


PhraseGame.hasMany(Session, {
    foreignKey: "phrasegame_id"
  });
  
Session.belongsTo(PhraseGame, { foreignKey: "phrasegame_id", as: "phrasegame" });


Session.hasMany(UserSessionGames, {
    foreignKey: "session_id"
  });
  
UserSessionGames.belongsTo(Session, { foreignKey: "session_id", as: "session" });


User.hasMany(UserSessionGames, {
  foreignKey: "user_id"
});

UserSessionGames.belongsTo(User, { foreignKey: "user_id", as: "user" });


Course.hasMany(Off, {
  foreignKey: "course_id"
});

Off.belongsTo(Course, { foreignKey: "course_id" });


User.hasMany(Off, {
  foreignKey: "creator_id",
  as : 'creator'
});

Off.belongsTo(User, { foreignKey: "creator_id" , as:'creator' });



Course.belongsToMany(Tag, {
  through: TagCourses,
  foreignKey: "course_id",
  onDelete: "CASCADE",
});

Tag.belongsToMany(Course, {
  through: TagCourses,
  foreignKey: "tag_id",
  onDelete: "CASCADE",
});



Article.belongsToMany(Tag, {
  through: TagArticles,
  foreignKey: "article_id",
  onDelete: "CASCADE",
});

Tag.belongsToMany(Article, {
  through: TagArticles,
  foreignKey: "tag_id",
  onDelete: "CASCADE",
});



Book.belongsToMany(Tag, {
  through: TagBooks,
  foreignKey: "book_id",
  onDelete: "CASCADE",
});

Tag.belongsToMany(Book, {
  through: TagBooks,
  foreignKey: "tag_id",
  onDelete: "CASCADE",
});



FreeBook.belongsToMany(Tag, {
  through: TagFreebooks,
  foreignKey: "freebook_id",
  onDelete: "CASCADE",
});

Tag.belongsToMany(FreeBook, {
  through: TagFreebooks,
  foreignKey: "tag_id",
  onDelete: "CASCADE",
});



User.belongsToMany(Course, {
  through: UserCourses,
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

Course.belongsToMany(User, {
  through: UserCourses,
  foreignKey: "course_id",
  onDelete: "CASCADE",
});



Off.belongsToMany(User, {
  through: OffUsers,
  foreignKey: "off_id",
  as : 'user',
  onDelete: "CASCADE",
});

User.belongsToMany(Off, {
  through: OffUsers,
  as : 'user',
  foreignKey: "user_id",
  onDelete: "CASCADE",
});



// Level.belongsToMany(Course, {
//   through: LevelCourse,
//   foreignKey: "level_id",
//   onDelete: "CASCADE",
// });

// Course.belongsToMany(Level, {
//   through: LevelCourse,
//   foreignKey: "course_id",
//   onDelete: "CASCADE",
// });



module.exports = { 
  db,
  Article,
  Book,
  Course,
  FreeBook,
  Level,
  MedaiGameQuestion,
  MedaiGame,
  PhraseGame,
  Q4game,
  q4gameQuestion,
  Role,
  Session,
  Tag,
  User,
  Ban,
  UserSessionGames,
  File,
  TagBooks,
  TagArticles,
  TagCourses,
  Sale,
  Off,
  OffUsers,
  Comment
};