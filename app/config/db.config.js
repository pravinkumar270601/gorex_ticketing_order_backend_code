module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "",
  DB: "d_gorex_ticketing_order_fulfilment_mysql_db",
  dialect: "mysql",
  timezone: "+05:30", // Indian Standard Time (UTC+5:30)
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  SMTP: {
    service: "gmail",
    user: "",
    pass: "",
  },
};
