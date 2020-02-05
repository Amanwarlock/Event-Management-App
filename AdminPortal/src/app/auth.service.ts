import { Injectable } from '@angular/core';
import { Observable, of, Subject, throwError } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  isLoggedIn$ = new Subject<any>();

  constructor(private http: HttpClient,  private router: Router) { }

  hasLoggedIn(): Observable<boolean>{
    return this.http.put('/api/v1/isLoggedIn',{}).pipe(
        tap((d:any)=>{}),
        catchError(this.handleError)
    );
  }

  login(data): Observable<any> {
    return this.http.post('/api/v1/login',data).pipe(
      tap((d:any) => {
        this.isLoggedIn$.next(true );
        localStorage.setItem('token',d.token);
        localStorage.setItem('isLoggedIn', "true");
        localStorage.setItem('user',JSON.stringify(d));
      }),
      catchError(this.handleError),
    );
  }

  logout(): Observable<boolean>  {
    let user: any = localStorage.getItem("user");
    user = JSON.parse(user);
    let email = user ? user.email: null;
    return this.http.put('/api/v1/logout', {email: email}).pipe(
      tap((d:any)=>{
        this.isLoggedIn$.next(false);
        this.router.navigate(['/login']);
        localStorage.clear();
      }),
      catchError(this.handleError),
    );
  }

  setRedirectUrl(url:string){
    localStorage.setItem("redirectUrl",url);
  }

  getRedirectUrl(){
    let url = localStorage.getItem("redirectUrl");
    url = url && typeof url === 'string' ? url: null; 
    localStorage.removeItem("redirectUrl");
    return url;
  }

  getUser(){
    let user = localStorage.getItem("user");
    return JSON.parse(user);
  }

  getToken(){
    return localStorage.getItem("token");
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
