import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';
import { EventRoutingModule } from './event-routing.module';
import { EventsComponent } from './events.component';
import { EventCardComponent } from './event-card/event-card.component';
import { AddEventComponent } from './add-event/add-event.component';
import { ViewEventComponent } from './view-event/view-event.component';
import { EditEventComponent } from './edit-event/edit-event.component';
import {ImageSecurePipe} from '../pipes/imageSecure.pipe';



@NgModule({
  declarations: [
    EventsComponent,
    EventCardComponent,
    AddEventComponent,
    ViewEventComponent,
    EditEventComponent,
    ImageSecurePipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    EventRoutingModule,
  ]
})
export class EventModule { }
