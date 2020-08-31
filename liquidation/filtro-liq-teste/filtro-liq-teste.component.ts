import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material';
import { firstNonNullOrUndefined } from 'src/app-commons/functions/functions';
import * as MMT from 'moment';

export interface LiquidationFiltersComponentProps {
  acquirerID: number;
  acquirerDisplayName: string;
  commerceID: number;
  commerceDisplayName: string;
  commerceDocumentID: string;
  dataInicio: MMT.Moment;
  dataFim: MMT.Moment;
}


@Component({
  selector: 'edi-filtro-liq-teste',
  templateUrl: './filtro-liq-teste.component.html',
  styleUrls: ['./filtro-liq-teste.component.css']
})

export class FiltroLiqTesteComponent implements OnInit {

  @Input('props')
  set setProps(props: LiquidationFiltersComponentProps) {
    this.acquirerID = firstNonNullOrUndefined(props.acquirerID, '');
    this.acquirerDisplayName = firstNonNullOrUndefined(props.acquirerDisplayName, '');
    this.commerceID = firstNonNullOrUndefined(props.commerceID, '');
    this.commerceDisplayName = firstNonNullOrUndefined(props.commerceDisplayName, '');
    this.commerceDocumentID = firstNonNullOrUndefined(props.commerceDocumentID, '');
    this.dataInicio = firstNonNullOrUndefined(props.dataInicio, '');
    this.dataFim = firstNonNullOrUndefined(props.dataInicio, '');
  }

  requestDateToMax: MMT.Moment;
  requestDateToMin: MMT.Moment;
  dataFim: MMT.Moment;

  shouldShowLoading: boolean = false;

  @Input('shouldAllowInteraction')
  _shouldAllowInteraction: boolean = true;
  _internalShouldAllowInteraction: boolean = true;

  @Output('didTouchClearButton')
  didTouchClearButtonEvent: EventEmitter<void> = new EventEmitter();

  @Output('didTouchApplyButton')
  didTouchApplyButtonEvent: EventEmitter<LiquidationFiltersComponentProps> = new EventEmitter();

  acquirerID: number = null;
  public didChangeAcquirerID(id: number) {
    this.acquirerID = id;
  }

  acquirerDisplayName: string = "";
  public didChangeAcquirerDisplayName(name: string) {
    this.acquirerDisplayName = name;
  }

  
  commerceID: number = null;
  public didChangeCommerceID(id: number) {
    this.commerceID = id;
  }

  commerceDisplayName: string = "";
  public didChangeCommerceDisplayName(name: string) {
    this.commerceDisplayName = name;
  }

  commerceDocumentID: string = null;
  public didChangeDocumentID(id: string) {
    this.commerceDocumentID = id;
  }

  dataInicio: MMT.Moment;
  public didChangeDataInicio(date: MMT.Moment) {
    this.dataInicio = date;
    this.requestDateToMin = date;
    //this.requestDateToMax = date.add(7, 'days');
    this.requestDateToMax = MMT(date, "DD-MM-YYYY").add(7, 'days');
  }

  //dataFim: MMT.Moment;
  public didChangeDataFim(date: MMT.Moment) {
    this.dataFim = date;
  }

  constructor() { }

  ngOnInit() {
  };

  public shouldAllowInteraction() {
    return this._internalShouldAllowInteraction && this._shouldAllowInteraction;
  }

  public didTouchClearButton() {
    this.didTouchClearButtonEvent.emit();
  }

  public didTouchApplyButton() {
    this.didTouchApplyButtonEvent.emit({
      acquirerDisplayName: this.acquirerDisplayName,
      acquirerID: this.acquirerID,
      commerceDisplayName: this.commerceDisplayName,
      commerceDocumentID: this.commerceDocumentID,
      commerceID: this.commerceID,
      dataInicio: this.dataInicio,
      dataFim: this.dataFim
    });
  }

    
}
