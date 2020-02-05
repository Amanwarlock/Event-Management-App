import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventsComponent } from './events.component';
import {AddEventComponent} from './add-event/add-event.component';
import { ViewEventComponent } from './view-event/view-event.component';
import { EditEventComponent } from './edit-event/edit-event.component';
import { AuthGuard } from '../auth.guard';

const routes: Routes = [
  {path: 'events', component: EventsComponent, canActivate: [AuthGuard] },
  {path: 'addevent', component: AddEventComponent , canActivate: [AuthGuard]},
  {path: 'viewevent/:id', component: ViewEventComponent, canActivate: [AuthGuard]},
  {path: 'editevent/:id', component: EditEventComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventRoutingModule { }
