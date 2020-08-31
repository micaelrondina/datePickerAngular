import { Component, OnInit, Input } from '@angular/core';
import { FeedbackDockComponent } from 'src/app-commons/feedback-dock/feedback-dock.component';

@Component({
  selector: 'edi-liquidation',
  templateUrl: './liquidation.component.html',
  styleUrls: ['./liquidation.component.css']
})
export class LiquidationComponent implements OnInit {

  @Input('feedbackDock')
  feedbackDock: FeedbackDockComponent;

  @Input('title')
  title: string = 'Relatório de Liquidação Subsequente';

  @Input('paths')
  paths: string[] = ['Liquidação']


  constructor() { }

  ngOnInit() {
  }

 ngOnDestroy() {
  }
}