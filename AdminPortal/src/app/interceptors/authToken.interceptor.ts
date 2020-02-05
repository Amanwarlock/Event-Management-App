import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

/** Pass untouched request through to the next request handler. */
@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService ){}
 
  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
      
      if(req.url === `/api/v1/login`) next.handle(req);
      
      const token = this.authService.getToken();
     
      if(token){
        const headerReq = req.clone({setHeaders: {'Authorization': token, 'authentication': token }})
        return next.handle(headerReq);
      }
     
      return next.handle(req);
  }
}