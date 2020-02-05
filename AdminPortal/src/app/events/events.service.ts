import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import {Observable, throwError, from } from 'rxjs';
import {startWith, map, tap, catchError, flatMap} from 'rxjs/operators';
import { FileService } from '../file.service';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(private http: HttpClient, private fileService: FileService) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/x-www-form-urlencoded',
    })
  };

  createEvent(data:any): Observable<any>{
   return this.http.post(`/api/v1/event`, data).pipe(
     tap((d:any)=>{

     }),
      catchError(this.handleError)
    );
  }


  uploadFile(data:any): Observable<any>{
    return this.http.post(`/api/v1/asset/upload`, data).pipe(
      tap((d:any)=>{

      }),
      catchError(this.handleError)
    );
  }

  // working
  uploadExample(data:any):Observable<any>{
    var myHeaders = new Headers();
    myHeaders.append("Authentication", localStorage.getItem('token'));
    
    var formdata = new FormData();
    formdata.append("uploadedFile", data, "/C:/Users/Student/Pictures/Screenshots/Screenshot (27).png");
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
    };
    
    return from(fetch("http://52.70.234.178/api/v1/asset/upload", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error)));

  }

  index(query,select,sort,page,count): Observable<any>{
    
    Object.defineProperty(RegExp.prototype, "toJSON", {
      value: RegExp.prototype.toString
    });

    let filter = query ? query: {};
    let api = `/api/v1/event?filter=${JSON.stringify(filter)}`; // encodeURIComponent(JSON.stringify(filter))

    if(select && select.length) api += `&select=${select.join(",")}`;

    if(sort && Object.keys(sort).length){
      api += `&sort=${JSON.stringify(sort)}`;
    }

    api += `&page=${page}&count=${count}`;

    return this.http.get(api).pipe(tap((d:any)=>{
      d = d && d.length ? d: [];
    },
    catchError(this.handleError)
    ));
  };

  eventCount(query:any): Observable<Number>{
    Object.defineProperty(RegExp.prototype, "toJSON", {
      value: RegExp.prototype.toString
    });

    let filter = query ? query: {};
    let api = `/api/v1/event/count?filter=${JSON.stringify(filter)}`; 
    return this.http.get(api).pipe(
      tap((d:any)=>{}),
      catchError(this.handleError)
      );
  }

  eventById(id: string): Observable<any>{
    return this.http.get(`/api/v1/event/${id}`).pipe(
      tap((d:any)=>{}),
      catchError(this.handleError)
      );
  }

  eventUpdate(event:any): Observable<any>{
    return this.http.put(`/api/v1/event`, event).pipe(
      tap((d:any)=>{}),
      catchError(this.handleError)
      );
  }

  downloadGuestPDF(id: string):Observable<any>{
    return this.http.get(`/api/v1/event/download/pdf/${id}`,{ responseType: 'blob' }).pipe(
      tap((res:any)=>{
        this.fileService.downloadFile(res,null);
      }),
      catchError(this.handleError)
      );
  }

  testHealth(){
      return this.http.get('/api/hearbeat').pipe(
        tap(d => {
          console.log("API ", d);
      }),
      catchError(this.handleError),
      );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };


}
