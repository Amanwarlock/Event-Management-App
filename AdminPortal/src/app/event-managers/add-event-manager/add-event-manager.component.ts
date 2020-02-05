import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import { Router } from '@angular/router';

import {PasswordValidation} from './password.validator';
import { EventManagerService } from '../event-manager.service';

@Component({
  selector: 'app-add-event-manager',
  templateUrl: './add-event-manager.component.html',
  styleUrls: ['./add-event-manager.component.scss']
})
export class AddEventManagerComponent implements OnInit {

  hide:boolean = true;
  step = 0;
  
  roles = [{
    value: 0,
    viewValue: 'Superadmin'
  },{
    value: 1,
    viewValue: 'Admin'
  }];

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  constructor(private router: Router, private fb: FormBuilder, private eventManagerService: EventManagerService) { }

  ngOnInit() {
  }

  personalData =  this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.required],
  });

  securityData = this.fb.group({
    password: ['', Validators.required],
    confirmPassword : ['', Validators.required],
  },{
    validator: PasswordValidation.MatchPassword
  });

  roleData = this.fb.group({
    role: ['', Validators.required],
  });

  OnCreate(){
    let newManager = {
      firstName: this.personalData.value.firstName,
      lastName: this.personalData.value.lastName,
      email: this.personalData.value.email,
      role: this.roleData.value.role === 0 ? 'SuperAdmin': 'Admin',
      password: this.securityData.value.password
    }
    this.eventManagerService.addManager(newManager).subscribe(data=>{
        this.router.navigate(['/eventmanagers']);
    });
  }


}

