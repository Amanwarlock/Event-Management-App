import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {Observable, throwError, from } from 'rxjs';
import {startWith, map, tap, catchError, flatMap} from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { isNumber } from 'util';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) {}

   randomNumber(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  
  generateImageName(imageType: string): string {
    const date = new Date().valueOf();
    let text = '';
    const possibleText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      text += possibleText.charAt(Math.floor(Math.random() *    possibleText.length));
    }
    const imageName = date + '.' + text + '.' + imageType;
    return imageName;
  }

  convertBase64ToImg(base64: string){
    const imageBlob = this.dataURItoBlob(base64);
    const fileName = this.generateImageName('png');
    const imageFile = new File([imageBlob], fileName, { type: 'image/png' });
  }

  dataURItoBlob(dataURI) {
    dataURI = dataURI.split(",")[1];
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });    
    return blob;
 }

  downloadFile(res,filename){
    let type = res.type;
    let extension = type.split("/")[1];
    let binaryData = [res];
    let url = window.URL.createObjectURL(new Blob(binaryData, {type: type}));
    let anchor = document.createElement("a");
   // window.open(url);
    anchor.href = url;
    if(filename){
      anchor.setAttribute("download", (filename.toString() + extension));
    }else{
      filename = this.randomNumber(1000);
      anchor.setAttribute("download", (filename.toString() + extension));
    }
    anchor.style.visibility = "hidden";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  saveFile(res,filename){
    let type = res.type;
    let extension = type.split("/")[1];
    let binaryData = [res];
    let blob = new Blob(binaryData, {type: type});
    if(filename){
      saveAs(blob, filename + extension);
    }else{
      filename = this.randomNumber(1000);
      saveAs(blob, filename + extension);
    }
   
  }

}
