module.exports = (sequelize, DataTypes) => {
    const Post_Image = sequelize.define('Post_Image', {
        url: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        PostId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'
    });
    Post_Image.associate = (db) => {
        db.Post_Image.belongsTo(db.Post);
    };
    return Post_Image;
}