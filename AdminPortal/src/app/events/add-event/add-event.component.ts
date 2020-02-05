import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import {Observable, throwError, from, pipe } from 'rxjs';
import {startWith, map, tap, catchError, flatMap, concat} from 'rxjs/operators';


import { EventsService } from '../events.service';



@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss']
})
export class AddEventComponent implements OnInit {

  eventNameGroup: FormGroup;
  eventDescriptionGroup: FormGroup;
  eventDateGroup: FormGroup;
  eventBannerGroup: FormGroup;
  eventGuestGroup: FormGroup;

  private files: Array<FileUploadModel> = [];
  private eventBannerFile: any;
  private guestFile: any;

  minDate: Date = new Date();

  constructor(private _formBuilder: FormBuilder, private eventService: EventsService, private router: Router) {}

  ngOnInit() {
    this.eventNameGroup = this._formBuilder.group({
      eventName: ['', Validators.required]
    });
    this.eventDescriptionGroup = this._formBuilder.group({
      eventDescription: ['', Validators.required]
    });
    this.eventDateGroup = this._formBuilder.group({
      eventDate: ['', Validators.required]
    });
    this.eventBannerGroup = this._formBuilder.group({
      eventBanner: ['', Validators.required]
    });
    this.eventGuestGroup = this._formBuilder.group({
      eventGuests: ['', Validators.required]
    });
  }

  // Upload event image
  OnEventBannerUpload(files: File[]){
    this.eventBannerFile = new FormData();
    this.eventBannerFile.append("uploadedFile", files[0]);
  }


  // Upload guests
  onGuestUpload(files: any) {
    // const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    // fileUpload.onchange = () => {
    //       for (let index = 0; index < fileUpload.files.length; index++) {
    //             const file = fileUpload.files[index];
    //             this.files.push({ data: file, state: 'in', 
    //               inProgress: false, progress: 0, canRetry: false, canCancel: true });
    //       }
    //      // this.uploadFiles();
    // };
    // fileUpload.click();
    this.guestFile = new FormData();
    this.guestFile.append('uploadedFile', files[0]);

      // var reader = new FileReader();
      // reader.readAsDataURL(files[0]);
      // reader.onload = function () {
      //   var fileContent = reader.result;
      // console.log("File reader------------------",fileContent);
      // }


}

OnEventCreate(){
  let newEvent = {
    name: this.eventNameGroup.value.eventName,
    description: this.eventDescriptionGroup.value.eventDescription,
    scheduledAt: new Date(this.eventDateGroup.value.eventDate),
    banner: null,
    guestFile: null
  };
  
  this.eventService.uploadFile(this.eventBannerFile).subscribe(d=>{
    newEvent.banner = d.fileInfo.filename;
    this.eventService.uploadFile(this.guestFile).subscribe(d => {
      newEvent.guestFile = d.fileInfo.filename;
        this.eventService.createEvent(newEvent).subscribe(d =>{
            this.router.navigate(['/events']);
        })
    });

  });
  

}


}


export class FileUploadModel {
  data: File;
  state: string;
  inProgress: boolean;
  progress: number;
  canRetry: boolean;
  canCancel: boolean;
  // sub?: Subscription;
}


//https://stackblitz.com/edit/angular-material-file-upload?file=src%2Fapp%2Fmaterial-file-upload%2Fmaterial-file-upload.component.ts

//https://stackblitz.com/edit/angular-file-upload