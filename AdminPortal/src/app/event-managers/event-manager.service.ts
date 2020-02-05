import { Injectable } from '@angular/core';
import { Observable, of, Subject, throwError } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EventManagerService {

  constructor(private http: HttpClient,  private router: Router) { }

  index(query,select,sort,page,count): Observable<any>{
    
    Object.defineProperty(RegExp.prototype, "toJSON", {
      value: RegExp.prototype.toString
    });

    let filter = query ? query: {};
    let api = `/api/v1/user?filter=${JSON.stringify(filter)}`; // encodeURIComponent(JSON.stringify(filter))

    if(select && select.length) api += `&select=${select.join(",")}`;

    if(sort && Object.keys(sort).length){
        api += `&sort=${JSON.stringify(sort)}`
    }

    api += `&page=${page}&count=${count}`;

    return this.http.get(api).pipe(tap((d:any)=>{
      d = d && d.length ? d: [];
      d.map(el=>{
        el.Name = `${el.firstName} ${el.lastName}`;
        el.role = el.role === 'SuperAdmin' ? 'Super Admin' : el.role;
      })
    },
    catchError(this.handleError)
    ));
  };

  addManager(data: any): Observable<any>{
    return this.http.post(`/api/v1/user`,data).pipe(
      tap((d:any)=>{}),
      catchError(this.handleError)
      );
  }

  userCount(query:any): Observable<Number>{
    Object.defineProperty(RegExp.prototype, "toJSON", {
      value: RegExp.prototype.toString
    });

    let filter = query ? query: {};
    let api = `/api/v1/user/count?filter=${JSON.stringify(filter)}`; 
    return this.http.get(api).pipe(
      tap((d:any)=>{}),
      catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      if(error.status === 401 || error.status === 403){
        this.router.navigate(['/login']);
      }
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };

}
