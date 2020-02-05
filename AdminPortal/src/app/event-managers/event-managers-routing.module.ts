import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventManagersComponent } from './event-managers.component';
import { AddEventManagerComponent } from './add-event-manager/add-event-manager.component';
import { AuthGuard } from '../auth.guard';

const routes: Routes = [
  {path: 'eventmanagers', component: EventManagersComponent, canActivate: [AuthGuard]},
  {path: 'addeventmanager', component: AddEventManagerComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventManagersRoutingModule { }
