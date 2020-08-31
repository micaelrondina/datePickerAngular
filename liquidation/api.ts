
export interface FiltroConsultar {
    acquirerID: number;
    dataInicio: string;
    dataFim: string;
    comercio: number;
}


export interface RelatorioSubsequente {
    idPagamento: number;
    idAdquirente: number;
    codProduto: number;
    descProduto: string;
    comercio: number;
    descComercio: string;
    dataLiquidacao: number;
    dataProcessamento: number;
    origenInterno: string;
    idRubrica: number;
    descRubrica: string;
    codOperacao: number;
    valor: number;
    dataVencimento: number;
}