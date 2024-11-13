import { Injectable } from '@angular/core';
import { CoreService } from '../core.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from '../interfaces/usuarios';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UsuariosService extends CoreService  {

  constructor(
    protected override http: HttpClient
) { 
    super(http);
}


validarCedulaCupo(jsonData: any) {
  return this.post<any>('/cupoejecutiva/rest/v1/CreditosDLM/ValidarCupoKaiowa', jsonData);  
}

obtenerMunicipios(): Observable<any[]> {
  return this.http.get<any[]>('../../../assets/json/departamentos.json');
}

simularCredito(jsonData: any): Observable<any> {
  return this.post<any>('/cupoejecutiva/rest/v1/CreditosDLM/GetSimulador',jsonData);
}

getProducto(jsonData: any): Observable<any> {
  return this.post<any>('/cupoejecutiva/rest/v1/CreditosDLM/GetProducto',jsonData);
}

desencriptarJson(jsonData: any): Observable<any> {
  return this.post<any>('/cupoejecutiva/rest/v1/CreditosDLM/DesencriptarJson',jsonData);
}

validarIVA(jsonData: any): Observable<any> {
  return this.post<any>('/cupoejecutiva/rest/v1/CreditosDLM/ValidarIVA',jsonData);
}




}
