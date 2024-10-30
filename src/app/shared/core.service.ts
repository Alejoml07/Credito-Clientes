import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export abstract class CoreService {
  protected http: HttpClient;
  // private urlBase = environment.urlPuntosLeonisa;
  private urlBase = environment.urlPuntosLeonisa;

  constructor(http: HttpClient) {
    this.http = http;
  }


  protected get<T>(url: string, options?: HttpParams): Observable<T> {
    const urlComplete = this.urlBase + url
    return this.http.get<T>(urlComplete);
  }

  protected post<T>(url: string, body: any, options?: HttpParams): Observable<T> {
    const urlComplete = this.urlBase + url
    return this.http.post<T>(urlComplete, body);
  }

  protected put<T>(url: string, body: any, options?: HttpParams): Observable<T> {
    const urlComplete = this.urlBase + url
    return this.http.put<T>(urlComplete, body);
  }

  protected delete<T>(url: string, options?: HttpParams): Observable<T> {
    const urlComplete = this.urlBase + url
    return this.http.delete<T>(urlComplete);
  }

}
