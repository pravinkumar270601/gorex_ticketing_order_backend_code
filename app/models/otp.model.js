module.exports = (sequelize, Sequelize) => {
    const OTP = sequelize.define("otp", {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        otp: {
            type: Sequelize.STRING,
            allowNull: false
        },
        expiresAt: {
            type: Sequelize.DATE,
            allowNull: false
        }
    });
    return OTP;
};
