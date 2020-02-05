import { Component, OnInit, ViewChild } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable, of, from} from 'rxjs';
import {startWith, map, tap, switchMap} from 'rxjs/operators';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import {EventModel} from './event.model';
import { EventsService } from './events.service';
import { MatPaginator } from '@angular/material';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  mySearchControl = new FormControl();
  dateSearchControl = new FormControl();
  filteredOptions$: Observable<string[]>;
  eventList$: Observable<EventModel[]>;
  pageCount$: Observable<Number>;

  defaultPage = 1;
  defaultCount = 10;

  select: string[] = ['_id', 'name', 'description', 'banner', 'scheduledAt', 'createdAt', 'createdBy', 'totalGuests'];

  constructor(private router: Router, private eventsService: EventsService) { }


  options: string[] = ['One', 'Two', 'Three'];

  ngOnInit() {

    this.autoSearch();

    this.paginator.page.pipe(tap(()=>{
      this.Onpaginate();
    })).subscribe();

    this.pageCount$ = this.eventsService.eventCount({});
    this.eventList$ = this.fetchEvents({},this.select,this.defaultPage,this.defaultCount);
   
  }

  autoSearch(){
    this.mySearchControl.valueChanges
    .pipe(
      startWith(''),
      tap(value => {
        if(value.length >= 3){
          this.eventList$ = this._filter(value);
        }
      })
    ).subscribe(d=>{});

    this.dateSearchControl.valueChanges.pipe(
      tap(value=>{
        this.eventList$ = this._filter(value);
      })
    ).subscribe(d=>{});

  }

  private _filter(value: string): Observable<EventModel[]> {
    //const filterValue = value.toLowerCase();
    let query:any = {};
    let eventNameField = this.mySearchControl.value;
    let dateField = this.dateSearchControl.value;
    
    if(eventNameField && eventNameField.trim()){
      eventNameField = eventNameField.toLowerCase();
      query.name =  new RegExp("^"+ eventNameField, "i");
    }
    if(dateField){
      let currentDate = new Date(dateField);
      let startDate = new Date(currentDate.getFullYear(),currentDate.getMonth(), (currentDate.getDate() - 1),23,59,59);
      let endDate = new Date(currentDate.getFullYear(),currentDate.getMonth(),currentDate.getDate(),23,59,59);
      query.scheduledAt = {[`$gte`]: startDate, [`$lte`]: endDate};
    }
    
    return this.fetchEvents(query,this.select,1,5);
    
  }

  OnCreateEvent(){
    this.router.navigate(['/addevent']);
  }

  OnViewEvent(event:EventModel){
    this.router.navigate(['/viewevent', event._id]);
  }

  fetchEvents(filter,select,page,count): Observable<EventModel[]>{
    const sort = {"createdAt": -1};
    return this.eventsService.index(filter,select,sort,page,count);
  }

  Onpaginate(){
    const page = this.paginator.pageIndex + 1;
    const count = this.paginator.pageSize;
    this.eventList$ = this.fetchEvents({},this.select,page,count);
  }

  OnResetDateField(){
    this.dateSearchControl.setValue("");
    this.eventList$ = this._filter(this.dateSearchControl.value);
  }

  OnResetEventNameField(){
    this.mySearchControl.setValue("");
    this.eventList$ = this._filter(this.mySearchControl.value);
  }

}
