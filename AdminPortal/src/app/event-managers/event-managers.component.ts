import { Component, OnInit, ViewChild } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { tap } from 'rxjs/operators';

import { EventManagerService } from "./event-manager.service";
import { Observable } from 'rxjs';

export interface EmployeeData {
  id: string;
  Name: string;
  role: string;
  email: string;
}


@Component({
  selector: 'app-event-managers',
  templateUrl: './event-managers.component.html',
  styleUrls: ['./event-managers.component.scss']
})
export class EventManagersComponent implements OnInit {

  apiSort = {"createdAt": -1};
  displayedColumns: string[] = ['id', 'Name', 'Role', 'email'];
  dataSource: MatTableDataSource<EmployeeData>;

  count$: Observable<Number>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  

  constructor(private router:Router, private eventManagerService: EventManagerService) { 
   
  }
  
  ngOnInit() {
    this.fetchEmployees();
    this.count$ = this.eventManagerService.userCount({});
  }

  Onpaginate(){
    const page = this.paginator.pageIndex + 1;
    const count = this.paginator.pageSize;
    const select = ["_id","firstName","lastName" ,"role","email"];
    this.eventManagerService.index({},select,this.apiSort,page,count).subscribe((employeeList:EmployeeData[])=>{
      this.dataSource = new MatTableDataSource(employeeList);
    });
  }

  OnAddEmployee(){
    this.router.navigate(['/addeventmanager']);
  }



  applyFilter(filterValue: string) {
    let value = filterValue.trim().toLowerCase();

    const select = ["_id","firstName","lastName" ,"role","email"];

    if(value.length >= 3){
      const exp = new RegExp("^"+ value, "i");
      let query = {$or: [{firstName: exp}, {lastName: exp}, {email: exp}, {role: exp}]};
      this.eventManagerService.index(query,select,this.apiSort,1,10).subscribe((employeeList: EmployeeData[])=>{
        this.dataSource = new MatTableDataSource(employeeList);
        this.dataSource.paginator.firstPage();
      });
    }else if(value.length === 0 ){
      this.eventManagerService.index({},select,this.apiSort,1,10).subscribe((employeeList: EmployeeData[])=>{
        this.dataSource = new MatTableDataSource(employeeList);
        this.dataSource.paginator.firstPage();
      });
    }

  }


/** Builds and returns a new User. */
fetchEmployees(): void {
  const select = ["_id","firstName","lastName" ,"role","email"];
  this.eventManagerService.index({},select,this.apiSort,1,10).subscribe((employeeList: EmployeeData[])=>{
    this.dataSource = new MatTableDataSource(employeeList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.paginator.page.pipe(tap(()=>{
      this.Onpaginate();
    })).subscribe();
  });
}


}
