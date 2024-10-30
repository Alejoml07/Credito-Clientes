import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { SecurityService } from '../service/security.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router, private securityService: SecurityService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const excludedUrls = [
        'https://apigatewayleonisatest.azurewebsites.net/api/Productos/GetBannerByEvent',
        'https://apigatewayleonisatest.azurewebsites.net/api/Productos/AddBannerEventos',
        'https://apigatewayleonisatest.azurewebsites.net/api/fidelizacion/AddEventoContenido',
        'https://apigatewayleonisatest.azurewebsites.net/api/fidelizacion/GetEventoContenidoByEvento'

    ];

    if (excludedUrls.some(url => request.url.includes(url))) {
        return next.handle(request);
    }

    const user = this.securityService.getUserAuthenticated();

    if (user) {
        const authReq = request.clone({
            headers: request.headers.set('Authorization', `Bearer ${user}`)
        });

        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    this.router.navigate(['/login']);
                }
                return throwError(error);
            })
        );
    }

    return next.handle(request).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                this.router.navigate(['/login']);
            }
            return throwError(error);
        })
    );
}
}

