import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { Pipe } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { v } from '@angular/core/src/render3';


const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8';
const EXCEL_EXT = '.xlsx';


@Injectable({
  providedIn: 'root'
})

@Pipe({
  name: 'currencyFormat'
})

export class ExportExcelService {


  colunasSheets: any = [
    {A:"PRODUTO", B:"NOME_PRODUTO", C:"COD_COMERCIO",
     D: "NOME_COMERCIO", E:"DATA_TRANSACAO", F:"DATA_LIQUIDACAO",
     G:"DEB_CRED", H:"RUBRICA", I:"DESC_RUBRICA",
     J:"VALOR", K:"ORIGEN_INTERNO"}
]

    constructor() {
   }
  

  exportToExcel(dados: any[], excelFileName: string): void {

    //Adicionando todas as colunas na linha 1 das sheets
    const worksheetLiquidacoes: XLSX.WorkSheet =  XLSX.utils.json_to_sheet(this.colunasSheets, {skipHeader: true}); //Linha 1 sheet Liquidacoes
    const worksheetAjustes: XLSX.WorkSheet =  XLSX.utils.json_to_sheet(this.colunasSheets, {skipHeader: true}); //Linha 1 sheet Ajustes
    const worksheetAntecipacoes: XLSX.WorkSheet =  XLSX.utils.json_to_sheet(this.colunasSheets, {skipHeader: true}); //Linha 1 sheet Antecipações

    /*
    for (var i = 0; i<dados.length;i++){
        if(dados[i].origen_interno = 'A'){
          
        }
    }
    */
    console.log(dados);
  
    var listaLiquidacoes: any[] = new Array();
    var listaAntecipacoes: any[] = new Array();
    var listaAjustes: any[] = new Array();



    dados.forEach(e => {
      if (e.origen_interno == 'A' || e.origen_interno == 'S'){ 

         var dadosAjustes = {
          A:e.producto, B:e.descripcionProduto, C:e.comercio,
          D:e.descripcionEC, E:e.fecha_valor, F:e.fecha_liquidacion, G:e.codigo_operacion,
          H:e.rubro, I:e.descripcionRubro, J:e.valor,KL:e.origen_interno

        }
        listaAjustes.push(dadosAjustes);
      }
      else if (e.origen_interno == 'V' || e.origen_interno == 'T' || e.origen_interno == 'G'){
        var dadosAntecipacoes = {
          A:e.producto, B:e.descripcionProduto, C:e.comercio,
          D:e.descripcionEC, E:e.fecha_valor, F:e.fecha_liquidacion, G:e.codigo_operacion,
          H:e.rubro, I:e.descripcionRubro, J:e.valor,KL:e.origen_interno
        }
        listaAntecipacoes.push(dadosAntecipacoes);
      }
      else {
        var dadosLiquidacoes = {
          A:e.producto, B:e.descripcionProduto, C:e.comercio,
          D:e.descripcionEC, E:e.fecha_valor, F:e.fecha_liquidacion, G:e.codigo_operacion,
          H:e.rubro, I:e.descripcionRubro, J:e.valor,KL:e.origen_interno
        }
        listaLiquidacoes.push(dadosLiquidacoes);
       // return;
      }
    });

    XLSX.utils.sheet_add_json(worksheetLiquidacoes, listaLiquidacoes, {skipHeader: true, origin: "A2"});
    XLSX.utils.sheet_add_json(worksheetAjustes, listaAjustes, {skipHeader: true, origin: "A2"});
    XLSX.utils.sheet_add_json(worksheetAntecipacoes, listaAntecipacoes, {skipHeader: true, origin: "A2"});

    /*
    idPagamento: number;
    idAdquirente: string;
    origenInterno: string;
    */

    const workbook: XLSX.WorkBook = {
      Sheets: { 
        'Liquidações': worksheetLiquidacoes,
        'Ajustes' : worksheetAjustes,
        'Antecipações Programadas' : worksheetAntecipacoes
      },
      SheetNames: ['Liquidações', 'Ajustes', 'Antecipações Programadas' ]
    };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    //chamar metodo buffeer e filename 
    this.saveAsExcel(excelBuffer, excelFileName);
  }

  private saveAsExcel(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE })

    FileSaver.saveAs(data, fileName + ' Liquidação Subsequente -' + this.montaDateYYYYmmdd_HHmmss() + EXCEL_EXT);

  }

  private montaDateYYYYmmdd_HHmmss(): any {
    var dt = new Date().toLocaleString("BR", { timeZone: "America/Recife" })
    var retorno: string =
      dt.substring(2, 5)  //dia
      + dt.substring(0, 1) //mes
      + dt.substring(4, 9) //ano
      + "_"
      + dt.substring(11).replace(":", "").replace(":", ""); //hora minuto segundo
    return retorno;
  }


  
  formatarBR(price: any) {
    var x =  Number(price).toLocaleString('pt-br')
   return x;
  // return Number(price).toLocaleString('pt-br').trim;
}

  formatarValorBR(price: number) {
    var numeros = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(price).replace("R$","").replace(",",".");
    var aux = parseFloat(numeros);
    console.log(aux);
    return aux;
}
  

}
