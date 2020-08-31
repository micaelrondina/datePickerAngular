import { Component, OnInit, Input } from '@angular/core';
import { FeedbackDockComponent } from 'src/app-commons/feedback-dock/feedback-dock.component';
import * as MMT from 'moment';
import 'hammerjs';
import { firstNonUndefined } from 'src/app-commons/functions/functions';
import { flatMap, tap, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { Entity } from 'src/app-main/entity/entity.models';
import { EntityService } from 'src/app-main/entity/entity.service';
import { ClientError } from 'src/app-commons/client-error/client-error.models';
import { LiquidationFiltersComponentProps } from '../filtro-liq-teste.component';
import { RelatorioSubsequente } from '../../api';
import { RelatorioService } from '../../relatorio.service';
import { ExportExcelService } from '../../export-excel.service';


export interface LiquidationComponentProps extends LiquidationFiltersComponentProps {
}

@Component({
  selector: 'edi-smt-filtr-liq-teste',
  templateUrl: './smt-filtr-liq-teste.component.html',
  styleUrls: ['./smt-filtr-liq-teste.component.css']
})


export class SmtFiltrLiqTesteComponent implements OnInit {

  relatorioSubsequente: RelatorioSubsequente[] = [];

  @Input('shouldAllowInteractionXLSX')

  @Input('feedbackDock')
  feedbackDock: FeedbackDockComponent;

  @Input('shouldAllowInteraction')
  _shouldAllowInteraction: boolean = true;
  _internalShouldAllowInteraction: boolean = true;

  shouldShowEntityList: boolean = false;

  @Input('props')
  set setProps(props: LiquidationComponentProps) {
    this.state = {
      commerceDocumentID: firstNonUndefined(props.commerceDocumentID, ''),
      acquirerID: firstNonUndefined(props.acquirerID, ''),
      acquirerDisplayName: firstNonUndefined(props.acquirerDisplayName, ''),
      commerceID: firstNonUndefined(props.commerceID, ''),
      commerceDisplayName: firstNonUndefined(props.commerceDisplayName, ''),
      dataInicio: firstNonUndefined(props.dataInicio, MMT().add(-30, 'days')),
      dataFim: firstNonUndefined(props.dataFim, MMT().add(-30, 'days')),
    }
  }
  
  state: LiquidationComponentProps = { acquirerDisplayName: '', acquirerID: null, commerceDisplayName: '',
                                       commerceID: null, commerceDocumentID: null, dataInicio: undefined, dataFim: undefined};
  
  private FEEDBACK_CIRCULARIZATION_ID = 'LiquidationComponent';


  constructor(private entityService: EntityService, private relatorioService: RelatorioService, private exportExcelService: ExportExcelService) { }

 
  public didTouchClearButton() {

    this.state = {
      ...this.state,
      commerceDocumentID: '',
      acquirerID: undefined,
      acquirerDisplayName: '',
      commerceID: undefined,
      commerceDisplayName: '',
      dataInicio: null,
      dataFim: null,
    };
  }

  public didTouchApplyButton(params: LiquidationFiltersComponentProps) {

    if(!params.commerceID && !params.commerceDisplayName && !params.commerceDocumentID && !params.dataInicio && !params.dataFim) {
      return this.feedbackDock.showMessage({
        title: 'Oops!',
        message: 'Você não preencheu nenhum campo de filtro.',
        type: 'WARN',
        duration: 6000
      });
    }

    if(
      this.state.commerceID != params.commerceID || 
      this.state.commerceDisplayName != params.commerceDisplayName || 
      this.state.commerceDocumentID != params.commerceDocumentID
    ) {
      this.commerceList = [];
      this.acquirerList = [];
    }

    this.state = {
      ...this.state,
      commerceDocumentID: params.commerceDocumentID,
      acquirerID: params.acquirerID,
      acquirerDisplayName: params.acquirerDisplayName,
      commerceID: params.commerceID,
      commerceDisplayName: params.commerceDisplayName,
      dataInicio: params.dataInicio,
      dataFim: params.dataFim,
    }

    this.loadContent({
      commerceDisplayName: params.commerceDisplayName, 
      documentID: params.commerceDocumentID,
      commerceID: params.commerceID,
      dataInicio: params.dataInicio, 
      dataFim: params.dataFim,
    });
  }

  commerceList: Entity[] = [];
  acquirerList: Entity[] = [];

  private loadContent(params: { commerceDisplayName: string, documentID: string, commerceID: number, dataInicio: MMT.Moment, dataFim: MMT.Moment}) {
    this.showLoadContentPending();
    console.log("010: " +params.commerceID)
    
    this.loadCommerce(params)
      .pipe(flatMap((commerce) => this.loadAcquirer(commerce)))
      .pipe(tap((commerceAndAcquirer) => {
        this.state = {
          ... this.state,
          commerceDocumentID: commerceAndAcquirer.commerce.documentID,
          acquirerID: commerceAndAcquirer.acquirer.acquirerID,
          acquirerDisplayName: commerceAndAcquirer.acquirer.displayName,
          commerceID: commerceAndAcquirer.commerce.commerceID,
          commerceDisplayName: commerceAndAcquirer.commerce.displayName,
        }
      }))
      .pipe(flatMap((commerceAndAcquirer) => this.loadDataTable({ acquirerID: commerceAndAcquirer.acquirer.acquirerID,
                                                                  commerceID: commerceAndAcquirer.commerce.commerceID,
                                                                  dataInicio: params.dataInicio,
                                                                  dataFim: params.dataFim,
                                                                  
      })))
      .subscribe(
        ()                  => this.showLoadContentSuccess(),
        (err : ClientError) => this.showLoadContentFailure(err)        
      );
  }

  private loadDataTable(params: {acquirerID: number, commerceID: number, dataInicio: MMT.Moment, dataFim: MMT.Moment}): Observable<RelatorioSubsequente[]> {
    return this.relatorioService.getRelatorioSubsequente(params).pipe(tap((dataTable) => {
      this.relatorioSubsequente = dataTable;
      if (this.relatorioSubsequente.length == 0)          
      throw new ClientError({ code: 'NO_DATATABLE_FOUND' });
    }))
  }

  private loadCommerce(params: { commerceDisplayName: string, documentID: string, commerceID: number }): Observable<Entity> {

    return (this.commerceList.length > 0
      ? of(this.commerceList)
      : this.entityService.getEntitiesByQuery({
        displayName: params.commerceDisplayName,
        allowedTypes: ['COMMERCE'],
        documentID: params.documentID,
        referenceID: params.commerceID,
        first: 0,
        last: 50,
      
      })).pipe(map((entities) => {
        this.commerceList = entities;
        
        if (this.commerceList.length == 0)
          throw new ClientError({ code: 'NO_COMMERCES_FOUND' });

        if (this.commerceList.length > 1){
          throw new ClientError({ code: 'MULTIPLE_ENTITIES_FOUND' });
        }

        return this.commerceList[0];
      }));
  }

  private loadAcquirer(commerce: Entity): Observable<{ acquirer: Entity, commerce: Entity }> {
    return (this.acquirerList.length > 0
      ? of(this.acquirerList)
      : this.entityService.getEntitiesByQuery({
        displayName: undefined,
        allowedTypes: ['ACQUIRER'],
        documentID: undefined,
        referenceID: commerce.acquirerID,
        first: 0,
        last: 1,
      
      })).pipe(map((entities) => {
        this.acquirerList = entities;

        if (entities.length == 0)          
          throw new ClientError({ code: 'NO_ACQUIRER_FOUND' });
         

        return { acquirer: this.acquirerList[0], commerce: commerce };
      }));
  }


  public didTouchConfirmEntitySelectionButton(entity: Entity) {
    this.commerceList = [entity];
    
    this.state = {
      commerceDocumentID: entity.documentID,
      acquirerID: entity.acquirerID,
      acquirerDisplayName: entity.displayName,
      commerceID: entity.commerceID,
      commerceDisplayName: this.state.commerceDisplayName,
      dataInicio: this.state.dataInicio,
      dataFim: this.state.dataFim,
    };
    
    this.loadContent({
      commerceDisplayName : this.state.commerceDisplayName, 
      commerceID : this.state.commerceID, 
      documentID : this.state.commerceDocumentID, 
      dataInicio : this.state.dataInicio,
      dataFim : this.state.dataFim,
    });
  }

  public didTouchCancelEntitySelectionButton() {
    this.shouldShowEntityList = false;
  }

  private showLoadContentPending() {
    this._internalShouldAllowInteraction = false;
    
    this.feedbackDock.showMessage({
      id: this.FEEDBACK_CIRCULARIZATION_ID,
      title: 'Carregando',
      message: 'Aguarde enquanto recuperamos os dados para o filtro selecionado.',
      type: 'LOADING'
    });

  }

  private showLoadContentSuccess() {
    this._internalShouldAllowInteraction = true;
    this.feedbackDock.showMessage({
      id: this.FEEDBACK_CIRCULARIZATION_ID,
      title:'Sucesso',
      type: 'SUCCESS',
      message:'Dados retornados com sucesso!',
      duration: 5000,
    })
    this._internalShouldAllowInteraction = true;
    // this.feedbackDock.deleteFeedbackById(this.FEEDBACK_CIRCULARIZATION_ID);
  }


  private showLoadContentFailure (err : ClientError) {
    this._internalShouldAllowInteraction = true;

    if (err.code == 'NO_COMMERCES_FOUND') {
      return this.feedbackDock.showMessage({
        id: this.FEEDBACK_CIRCULARIZATION_ID,
        title: 'Oops!',
        message: 'Nenhum comércio foi encontrado para os filtros informados',
        type: 'WARN'
      });
    }
    
    if (err.code == 'NO_DATATABLE_FOUND'){
      return this.feedbackDock.showMessage({
        id: this.FEEDBACK_CIRCULARIZATION_ID,
        title: 'Oops!',
        message: 'Não foram encontradas informações para os filtros selecionados',
        type: 'WARN'
      });
    }

    if (err.code === 'MULTIPLE_ENTITIES_FOUND'){
      this.shouldShowEntityList = true;      
      return this.feedbackDock.deleteFeedbackById(this.FEEDBACK_CIRCULARIZATION_ID);
    }

    return this.feedbackDock.showMessage({
      id: this.FEEDBACK_CIRCULARIZATION_ID,
      title: 'Oops!',
      message: 'Um erro inesperado impediu a sua requisição de ser atendida, checar filtros',
      type: 'FAILURE'
    });
  }

  public shouldAllowInteraction (){
    return this._internalShouldAllowInteraction && this._shouldAllowInteraction;
  }


  public shouldAllowInteractionXLSX (){
    return this._internalShouldAllowInteraction && this._shouldAllowInteraction && this.relatorioSubsequente.length > 0;
  }

  public exportXLSX() {
    this.feedbackDock.showMessage({
      id: this.FEEDBACK_CIRCULARIZATION_ID,
      title: 'Exportando',
      message: 'Exportando os dados para Excel ',
      type: 'LOADING',
      duration: 50000,
    });

    this.exportExcelService.exportToExcel(this.relatorioSubsequente, 'Relatório');

  }


  ngOnInit() {
  }

}
