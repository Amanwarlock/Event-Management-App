import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

/** Pass untouched request through to the next request handler. */
@Injectable()
export class HeaderInterceptor implements HttpInterceptor {

    httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
        })
      };

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
   
    if(req.url === '/api/v1/asset/upload' ) return next.handle(req);

    let headers = req.url === '/api/v1/asset/upload' ? {'Content-Type': 'application/x-www-form-urlencoded' } : {'Content-Type': 'application/json' };
    const headerReq = req.clone({setHeaders: headers})
   
    return next.handle(headerReq);
  }
}