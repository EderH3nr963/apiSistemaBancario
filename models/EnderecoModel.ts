import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import sequelize from "../config/database";

class EnderecoModel extends Model<
  InferAttributes<EnderecoModel>,
  InferCreationAttributes<EnderecoModel>
> {
  public id_endereco!: CreationOptional<number>;
  public rua!: string;
  public numero!: number;
  public cidade!: string;
  public uf!: string;
  public id_usuario!: number;
}

EnderecoModel.init(
  {
    id_endereco: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    rua: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cidade: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uf: {
      type: DataTypes.CHAR(2),
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
    tableName: "endereco",
    sequelize,
  }
);

export default EnderecoModel;
