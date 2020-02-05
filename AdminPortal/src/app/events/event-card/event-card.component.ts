import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent implements OnInit {

  @Input() event;

  constructor() { }

  ngOnInit() {
  }

  getImageUrl(event){
    return `/api/v1/asset/img/${event.banner}`;
  }

}
