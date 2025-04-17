module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        title: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci'
    });
    Post.associate = (db) => {
        db.Post.belongsTo(db.User);
        db.Post.hasMany(db.Comment);
        db.Post.hasMany(db.Post_Image);
        db.Post.belongsToMany(db.User, { through: 'Like', as: 'Likers' });
        db.Post.hasMany(db.Post_Image);
    }
    return Post;
}