import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import sequelize from "../config/database";
import * as bcrypt from "bcrypt-ts";

import TransacaoModel from "./TransacaoModel";
import UsuarioModel from "./UsuarioModel";

class ContaModel extends Model<
  InferAttributes<ContaModel>,
  InferCreationAttributes<ContaModel>
> {
  public id_conta!: CreationOptional<number>;
  public tipo_conta!: string;
  public saldo!: CreationOptional<number>;
  public status_conta!: CreationOptional<string>;
  public chave_transferencia!: string;
  public password!: string;
  public id_usuario!: number;
  public usuario?: UsuarioModel;
  public validPassword!: (password: string) => Promise<boolean>;
}

ContaModel.init(
  {
    id_conta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    tipo_conta: {
      type: DataTypes.ENUM("corrente", "poupanca"),
      allowNull: false,
      defaultValue: "corrente",
    },
    saldo: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    chave_transferencia: {
      type: DataTypes.STRING,
      unique: true
    },
    status_conta: {
      type: DataTypes.ENUM("ativa", "bloqueada", "desativada"),
      allowNull: false,
      defaultValue: "ativa",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuario",
        key: "id_usuario",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  {
    tableName: "conta_bancaria",
    sequelize,
  }
);

ContaModel.addHook("beforeCreate", async (conta: any) => {
  const salt = await bcrypt.genSalt(10);
  conta.password = await bcrypt.hash(conta.password, salt);
});

ContaModel.addHook("beforeUpdate", async (conta: any) => {
  if (conta.changed("password")) {
    const salt = await bcrypt.genSalt(10);
    conta.password = await bcrypt.hash(conta.password, salt);
  }
});

ContaModel.prototype.validPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export default ContaModel;
