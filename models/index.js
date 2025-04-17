const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.Post = require('./post')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);
db.Comment = require('./comment')(sequelize, Sequelize);
db.Post_Image = require('./post_image')(sequelize, Sequelize);
db.Email_Verification = require('./email_verification')(sequelize, Sequelize);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
