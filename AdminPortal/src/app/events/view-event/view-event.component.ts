import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { EventsService } from '../events.service';
import { Observable } from 'rxjs';
import { EventModel } from '../event.model';
import { switchMap, tap } from 'rxjs/operators';
import * as moment from 'moment';


@Component({
  selector: 'app-view-event',
  templateUrl: './view-event.component.html',
  styleUrls: ['./view-event.component.scss']
})
export class ViewEventComponent implements OnInit {

  
  displayedColumns: string[] = ['id', 'first name', 'last name', 'email'];
  dataSource: MatTableDataSource<EventModel>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild('content', {static: false}) content: ElementRef;

  event$: Observable<EventModel>;
  eventGuests: [];

  constructor(private router:Router,private route: ActivatedRoute, private eventsService: EventsService, private sanitizer: DomSanitizer) { }
  
  ngOnInit() {
    this.fetchEvent();
  }

  ngAfterViewInit(){
      // this.paginator.page.pipe(tap(()=>{
      //      this.guestsPagination(this.dataSource.paginator);
      //   })).subscribe();
  }

  fetchEvent(): void{
    this.event$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.eventsService.eventById(params.get('id'))),
      tap(event=>{
        this.eventGuests = event.guests;
        this.dataSource = new MatTableDataSource(event.guests);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      })
    );
  }

  guestsPagination(paginator){
    let page = paginator.pageIndex;
    let count = paginator.pageSize;
    console.log("Guest Pagination--------", page,count);
  }

  getImageUrl(event:EventModel){
    return `/api/v1/asset/img/${event.banner}`;
  }

  OnEditEvent(event: EventModel){
      this.router.navigate(['/editevent', event._id]);
    
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  downloadAsCSV(event){
      let file = new FileReader();
      let fields = event.guests && event.guests.length ? Object.keys(event.guests[0]): [];
      let opts = {fields};
      try{
        //let csv = json2csv(event.guests,opts);
        let csv = this.ConvertToCSV(event.guests, fields);
        //this.download(csv,null);
        this.downloadFile(csv,null);
        console.log("CSV---", csv);
      }catch(e){
        console.log("error occured while downloading csv file", e);
      }
      //csvjson
     
  }

  downloadAsPDF(event,fileName){
    this.eventsService.downloadGuestPDF(event._id).subscribe();
  }

  downloadFile(data, filename='data') {
    let csvData = this.ConvertToCSV(data, ['name','age', 'average', 'approved', 'description']);
    console.log(csvData)
    let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    let anchor = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
      anchor.setAttribute("target", "_blank");
    }
    anchor.setAttribute("href", url);
    anchor.setAttribute("download", filename + ".csv");
    anchor.style.visibility = "hidden";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

download(data,type){
  const blob = new Blob([data], { type: 'application/octet-stream' });
  let fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  let anchor = document.createElement("a");
  anchor.setAttribute("href", fileUrl.toString());
  anchor.setAttribute("download", 'guest' + ".csv");
  anchor.style.visibility = "hidden";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

ConvertToCSV(objArray, headerList) {
     let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
     let str = '';
     let row = 'S.No,';

     for (let index in headerList) {
         row += headerList[index] + ',';
     }
     row = row.slice(0, -1);
     str += row + '\r\n';
     for (let i = 0; i < array.length; i++) {
         let line = (i+1)+'';
         for (let index in headerList) {
            let head = headerList[index];

             line += ',' + array[i][head];
         }
         str += line + '\r\n';
     }
     return str;
 }

}
