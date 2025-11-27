import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  HasMany,
} from "sequelize";
import sequelize from "../config/database";
import ParcelaModel from "./ParcelaModel";

class EmprestimoModel extends Model<
  InferAttributes<EmprestimoModel>,
  InferCreationAttributes<EmprestimoModel>
> {
  public id_emprestimo!: CreationOptional<number>;
  public id_conta!: number;
  public valor!: number;
  public taxa_juros!: number;
  public prazo_meses!: number;
  public saldo_devedor!: number;
  public status!: string;
  public data_solicitacao!: CreationOptional<Date>;
  public data_aprovacao?: Date;
}

EmprestimoModel.init(
  {
    id_emprestimo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_conta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "conta_bancaria",
        key: "id_conta",
      },
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    taxa_juros: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.01, //1% ao Mês
    },
    prazo_meses: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    saldo_devedor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pendente", "aprovado", "pago", "rejeitado"),
      allowNull: false,
      defaultValue: "pendente",
    },
    data_solicitacao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    data_aprovacao: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "emprestimo",
    sequelize,
  }
);

export default EmprestimoModel;