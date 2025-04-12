import { Sequelize } from "sequelize";

const sequelize = new Sequelize('banco_financeiro', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

export default sequelize;
