import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import {SettingService} from './setting.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  user$: Observable<any>;
  user: any;
  id: string;

  constructor(private router:Router, private settingService:SettingService, private authService: AuthService) {
    
   }

  ngOnInit() {
    //user$ = this.settingService();
    this.user = this.authService.getUser();
  }

}
