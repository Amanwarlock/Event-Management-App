import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { EventsService } from '../events.service';
import { EventModel } from '../event.model';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.scss']
})
export class EditEventComponent implements OnInit {

  event$: Observable<EventModel>;
  event:any;

  eventNameGroup: FormGroup;
  eventDescriptionGroup: FormGroup;
  eventDateGroup: FormGroup;
  eventBannerGroup: FormGroup;
  eventGuestGroup: FormGroup;

  private eventBannerFile: any;
  private guestFile: any;

  constructor(private router:Router,private route: ActivatedRoute, private eventsService: EventsService, private _formBuilder: FormBuilder,) { }

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

    this.fetchEvent();
  }

  fetchEvent(): void{
    let id = this.route.snapshot.paramMap.get('id');
    //this.event$ = this.eventsService.eventById(id);
    this.event$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.eventsService.eventById(params.get('id'))),
      tap(event=>{
          this.event = event;
          this.eventNameGroup.patchValue({eventName: event.name});
          this.eventDescriptionGroup.patchValue({eventDescription: event.description});
          this.eventDateGroup.patchValue({eventDate: moment(event.scheduledAt)}) 
      })
    );

  }

   // Upload event image
   OnEventBannerUpload(files: File[]){
    this.eventBannerFile = new FormData();
    this.eventBannerFile.append("uploadedFile", files[0]);
  }

   // Upload guests
   onGuestUpload(files: any) {  
    this.guestFile = new FormData();
    this.guestFile.append('uploadedFile', files[0]);
      // var reader = new FileReader();
      // reader.readAsDataURL(files[0]);
      // reader.onload = function () {
      //   var fileContent = reader.result;
      // console.log("File reader------------------",fileContent);
      // }
  }

  OnUpdate(){
    this.event.name = this.eventNameGroup.value.eventName;
    this.event.description = this.eventDescriptionGroup.value.eventDescription;
    this.event.scheduledAt = new Date(this.eventDateGroup.value.eventDate);

    const bannerUploadPromise = new Promise((resolve,reject)=>{
      if(this.eventBannerFile){
        this.eventsService.uploadFile(this.eventBannerFile).subscribe(d=>{
          this.event.banner = d.fileInfo.filename;
          resolve();
        });
      }else{
        resolve();
      }
    });

    const guestUploadPromise = new Promise((resolve,reject)=>{
      if(this.guestFile){
        this.eventsService.uploadFile(this.guestFile).subscribe(d => {
          this.event.guestFile = d.fileInfo.filename;
          resolve();
        });
      }else{
        resolve();
      }
    });
    
    Promise.all([bannerUploadPromise,guestUploadPromise]).then(d=>{
      this.eventsService.eventUpdate(this.event).subscribe(d=>{
        this.router.navigate(['/events']);
      });
    }).catch(e => console.log("Error occured while updating event ", e.message));

  }

}
