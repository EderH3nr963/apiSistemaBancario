import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import sequelize from "../config/database";

class PagamentoModel extends Model<
  InferAttributes<PagamentoModel>,
  InferCreationAttributes<PagamentoModel>
> {
  public id_pagamento!: CreationOptional<number>;
  public id_conta_destino!: number;
  public valor!: number;
  public chave_pagamento!: string;
  public status_pagamento!: string;
}

PagamentoModel.init(
  {
    id_pagamento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_conta_destino: {
      type: DataTypes.INTEGER,
      references: {
        model: "conta_bancaria",
        key: "id_conta"
      }
    },
    status_pagamento: {
      type: DataTypes.ENUM("pendente", "rejeitada", "aceita", "cancelada"),
    },
    chave_pagamento: {
      type: DataTypes.STRING,
      unique: true,
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
    },
  },
  {
    tableName: "pagamento",
    sequelize,
  }
);

export default PagamentoModel;
