import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';
import { EventManagersRoutingModule } from './event-managers-routing.module';
import { EventManagersComponent } from './event-managers.component';
import { AddEventManagerComponent } from './add-event-manager/add-event-manager.component';


@NgModule({
  declarations: [
    EventManagersComponent,
    AddEventManagerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    EventManagersRoutingModule
  ]
})
export class EventManagersModule { }
