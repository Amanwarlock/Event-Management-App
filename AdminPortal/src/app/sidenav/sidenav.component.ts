import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {

  @Input('user') user;

  eventManager: any;

  sideNavList: {name: string, icon: string, link: string}[] = [{
    name: 'Events',
    icon: 'event',
    link: '/events'
  },{
    name: 'Event Managers',
    icon: 'person',
    link: '/eventmanagers'
  },{
    name: 'Settings',
    icon: 'settings_application',
    link: '/settings'
  }];

  constructor(private activatedRoute: ActivatedRoute, private router: Router , private authService: AuthService ) { }

  ngOnInit() {
    this.eventManager = this.authService.getUser();
  }

   onMenuSelect(item:{name: string, icon: string, link: string}):void {
    this.router.navigate([item.link]);
  }

}
