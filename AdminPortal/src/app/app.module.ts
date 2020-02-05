import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { SidenavComponent } from './sidenav/sidenav.component';
import { EventModule } from './events/event.module';
import { EventManagersModule } from './event-managers/event-managers.module';
import { SettingsModule } from './settings/settings.module';
import { LoginModule } from './login/login.module';
import {HeaderInterceptor} from './interceptors/header.interceptor';
import { AuthTokenInterceptor } from './interceptors/authToken.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    SidenavComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    EventModule,
    EventManagersModule,
    SettingsModule,
    LoginModule,
    HttpClientModule,
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi:true},
    {provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi:true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
