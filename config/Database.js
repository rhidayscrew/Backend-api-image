import { Sequelize } from "sequelize";

const db = new Sequelize("tesproduct", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

export default db;
