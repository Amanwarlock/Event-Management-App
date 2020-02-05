import { Component, OnInit } from '@angular/core';
import { Router }      from '@angular/router';

import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  hide = true;
  //email = new FormControl('', [Validators.required, Validators.email]);

  loginForm =  this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  });

  // loginForm = new FormGroup({
  //   email: new FormControl(''),
  //   password: new FormControl('')
  // });
  
  constructor(private router: Router, private authService: AuthService, private fb: FormBuilder) {
   
  }


  getErrorMessage() {
    // return this.email.hasError('required') ? 'You must enter a value' :
    //     this.email.hasError('email') ? 'Not a valid email' :
    //         '';
  }


   login(){

     const data = {
       email: this.loginForm.value.email,
       password: this.loginForm.value.password,
       role: 'SuperAdmin'
     }

      this.authService.login(data).subscribe(() => {
        let redirectUrl = this.authService.getRedirectUrl();
          if(redirectUrl){
            let redirect = this.router.parseUrl(redirectUrl);
            this.router.navigateByUrl(redirect);
          }else{
            this.router.navigate(['/events']);
          }
      });
   }

  ngOnInit() {
  }

}
