module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        email: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        nickname: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            allowNull: false,
            defaultValue: 'user'
        }
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'
    });
    User.associate = (db) => {
        db.User.hasMany(db.Post);
        db.User.hasMany(db.Comment);
        db.User.hasOne(db.Email_Verification);
    };
    return User;
}