module.exports = (sequelize, Sequelize) => {
  const Tutorial = sequelize.define("tutorials", {
    id:{
      allowNull:false,
      autoIncrement:true,
      primaryKey:true,
      type:Sequelize.INTEGER
    },
    firstName:{
      type:Sequelize.STRING,
      allowNull:false,
    },
    lastName:{
      type:Sequelize.STRING,
      allowNull:false,
    },
    phoneNumber:{
      type:Sequelize.INTEGER,
      allowNull:false,
    },
    emailAddress:{
      type:Sequelize.STRING,
      allowNull:false,
    },
    gender:{
      type:Sequelize.STRING,
      allowNull:false,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  });

  return Tutorial;
};
