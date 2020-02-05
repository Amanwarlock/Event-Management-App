import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import {Observable, of} from 'rxjs';
import {startWith, map} from 'rxjs/operators';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  showDashboard = false;
  user: any;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private authService: AuthService){ }

  ngOnInit() {
    
    this.activatedRoute.url.subscribe(url => console.log('The URL changed to: ' + url));
    
    of(this.router.url).subscribe(url =>{
      console.log("ROuter url change ", url);
    });
    
    this.authService.isLoggedIn$.subscribe((flag: boolean)=>{
      console.log("Is loggedIn", flag);
    });

    this.authService.isLoggedIn$.asObservable().subscribe(flag=>{
      this.showDashboard = flag;
    });

    this.user = this.authService.getUser();

  }

  logout(){
    this.authService.logout().subscribe(()=>{
      this.router.navigate(['/login']);
    });
  }

}
