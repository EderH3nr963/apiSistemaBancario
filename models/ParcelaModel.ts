import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import sequelize from "../config/database";

class ParcelaModel extends Model<
  InferAttributes<ParcelaModel>,
  InferCreationAttributes<ParcelaModel>
> {
  public id_parcela!: CreationOptional<number>;
  public id_emprestimo!: number;
  public numero_parcela!: number;
  public valor_parcela!: number;
  public data_vencimento!: Date;
  public status!: string;
  public data_pagamento?: Date;
}

ParcelaModel.init(
  {
    id_parcela: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_emprestimo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "emprestimo",
        key: "id_emprestimo",
      },
    },
    numero_parcela: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    valor_parcela: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    data_vencimento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pendente", "pago", "atrasado"),
      allowNull: false,
      defaultValue: "pendente",
    },
    data_pagamento: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "parcela",
    sequelize,
  }
);

export default ParcelaModel;