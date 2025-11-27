import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  ForeignKey,
} from "sequelize";
import sequelize from "../config/database";
import ContaModel from "./ContaModel"; // importe o modelo de conta

class TransacaoModel extends Model<
  InferAttributes<TransacaoModel>,
  InferCreationAttributes<TransacaoModel>
> {
  declare id_transacao: CreationOptional<number>;
  declare id_conta_origem: ForeignKey<number | null>;
  declare id_conta_destino: ForeignKey<number | null>;
  declare tipo: string;
  declare valor: number;
  declare descricao: string;
  declare date: string;
  declare hora: string;
  declare status: CreationOptional<string>;
  public conta_origem?: ContaModel;
  public conta_destino?: ContaModel;
}

TransacaoModel.init(
  {
    id_transacao: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    id_conta_origem: {
      type: DataTypes.INTEGER,
      references: {
        model: "conta_bancaria",
        key: "id_conta",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    id_conta_destino: {
      type: DataTypes.INTEGER,
      references: {
        model: "conta_bancaria",
        key: "id_conta",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hora: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("cancelada", "aprovada"),
      allowNull: false,
      defaultValue: "aprovada",
    },
  },
  {
    tableName: "transacao",
    sequelize,
  }
);

export default TransacaoModel;
