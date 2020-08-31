import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { RelatorioSubsequente } from './api';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as MMT from 'moment';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {


constructor(private http: HttpClient) { }

public getRelatorioSubsequente(params: { acquirerID: number, commerceID: number, dataInicio: MMT.Moment, dataFim: MMT.Moment }): Observable<RelatorioSubsequente[]> {
  return this.http.get('/liquidation/subsequente', {
    params: <any> {
      acquirerID: params.acquirerID,
      commerceID: params.commerceID,
      dataInicio: params.dataInicio.format('YYYYMMDD'),
      dataFim: params.dataFim.format('YYYYMMDD')
    }
  }).pipe(map((arr: RelatorioSubsequente[]) => arr));
}
  
}
