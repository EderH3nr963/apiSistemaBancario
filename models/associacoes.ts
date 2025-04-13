import ContaModel from "./ContaModel";
import TransacaoModel from "./TransacaoModel";
import UsuarioModel from "./UsuarioModel";
import EnderecoModel from "./EnderecoModel";
import PagamentoModel from "./PagamentoModel";

// Usuário tem uma conta
UsuarioModel.hasOne(ContaModel, {
  as: "conta_bancaria",
  foreignKey: "id_usuario"
});
ContaModel.belongsTo(UsuarioModel, {
  as: "usuario",
  foreignKey: "id_usuario"
});

// Usuário tem um endereço
UsuarioModel.hasOne(EnderecoModel, {
  as: "endereco",
  foreignKey: "id_usuario"
});
EnderecoModel.belongsTo(UsuarioModel, {
  as: "usuario",
  foreignKey: "id_usuario"
});

// Conta tem muitas transações como origem
ContaModel.hasMany(TransacaoModel, {
  as: "transacoesOrigem",
  foreignKey: "id_conta_origem",
});

// Conta tem muitas transações como destino
ContaModel.hasMany(TransacaoModel, {
  as: "transacoesDestino",
  foreignKey: "id_conta_destino",
});

// Conta tem muitos pagamentos como destino
ContaModel.hasMany(PagamentoModel, {
  as: "pagamento_destino",
  foreignKey: "id_conta_destino"
})

// Pagamento pertence a uma conta de destino
PagamentoModel.belongsTo(UsuarioModel, {
  as: "conta_destino",
  foreignKey: "id_conta_destino"
})

// Transação pertence a uma conta de origem
TransacaoModel.belongsTo(ContaModel, {
  as: "conta_origem",
  foreignKey: "id_conta_origem",
});

// Transação pertence a uma conta de destino
TransacaoModel.belongsTo(ContaModel, {
  as: "conta_destino",
  foreignKey: "id_conta_destino",
});
