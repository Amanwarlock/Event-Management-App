import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventManagersComponent } from './event-managers.component';

describe('EventManagersComponent', () => {
  let component: EventManagersComponent;
  let fixture: ComponentFixture<EventManagersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventManagersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventManagersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
