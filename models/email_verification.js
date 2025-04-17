module.exports = (sequelize, DataTypes) => {
    const Email_Verification = sequelize.define('Email_Verification', {
       token: {
           type: DataTypes.STRING,
           allowNull: false,
           unique: true
       },
        expiresAt: {
           type: DataTypes.DATE,
            allowNull: false
        },
        verified: {
           type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'
    });

    Email_Verification.associate = (db) => {
        db.Email_Verification.belongsTo(db.User);
    }
    return Email_Verification;
}