import { Injectable } from '@angular/core';
import { CoreService } from '../core.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import Swal from 'sweetalert2';
import { BehaviorSubject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class SecurityService extends CoreService {

  constructor(protected override http: HttpClient, private storageService: StorageService) { 
    super(http);
}


 
  authenticationservice(data) {
    return this.http.post<any>('https://srvappsha.leonisa.com/Aplicativos_Informaticos/AuthService/api/v2/login', data)
  }
  
  changeLoggedIn(arg0: boolean) {
    throw new Error('Method not implemented.');
  }
  
  private loggedIn = new BehaviorSubject<boolean>(false);


  logout() {
    this.loggedIn.next(false);
    this.storageService.removeItem('msauc_user');
}

  get isLoggedIn() {
    return this.storageService.getItem('msauc_user') ? true : false;
}

getUserAuthenticated() {
  if (this.isLoggedIn) {
      return this.storageService.getItem('msauc_user');
  }
}

getUserAuthenticatedNombre() {
  if (this.isLoggedIn) {
      return this.storageService.getItem('fullName');
  }
}
  
authenticationservicePOS(data) {
  console.log('login pos service')
  return this.http.post<any>('https://srvextranet.leonisa.com/Aplicativos_Informaticos/posservice/api/securityexternal/validarIngreso', data)
}



getFletes(data, authToken) {
  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Authorization': `Bearer ${authToken}`
  });
  return this.http.post<any>('https://srvextranet.leonisa.com/Aplicativos_Informaticos/posservice/api/CCDLM/getFletes', data, { headers })
}
 

generateValidationCode(data: any, authToken: string, customHeaders: HttpHeaders) {
  const headers = customHeaders
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${authToken}`);
  
  return this.http.post<any>(
    'https://srvextranet.leonisa.com/Aplicativos_Informaticos/posservice/api/Kaiowa/generateValidationCode',
    data,
    { headers }
  );
}

verifyValidationCode(data: any, authToken: string, customHeaders: HttpHeaders) {
  const headers = customHeaders
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${authToken}`);
  
  return this.http.post<any>(
    'https://srvextranet.leonisa.com/Aplicativos_Informaticos/posservice/api/Kaiowa/verifyValidationCode',
    data,
    { headers }
  );
}
 

}
