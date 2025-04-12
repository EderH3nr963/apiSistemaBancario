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
import EnderecoModel from "./EnderecoModel";
import ContaModel from "./ContaModel";

class UsuarioModel extends Model<
  InferAttributes<UsuarioModel>,
  InferCreationAttributes<UsuarioModel>
> {
  public id_usuario!: CreationOptional<number>;
  public full_name!: string;
  public email!: string;
  public telefone!: string;
  public cpf!: string;
  public password!: string;
  public is_inactive!: CreationOptional<boolean>;
  public is_admin!: CreationOptional<boolean>;
  public validPassword!: (password: string) => Promise<boolean>;
}

UsuarioModel.init(
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_inactive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "usuario",
    sequelize,
  }
);

UsuarioModel.addHook("beforeCreate", async (usuario: any) => {
  const salt = await bcrypt.genSalt(10);
  usuario.password = await bcrypt.hash(usuario.password, salt);
});

UsuarioModel.addHook("beforeUpdate", async (usuario: any) => {
  if (usuario.changed("password")) {
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(usuario.password, salt);
  }
});

UsuarioModel.prototype.validPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export default UsuarioModel;
