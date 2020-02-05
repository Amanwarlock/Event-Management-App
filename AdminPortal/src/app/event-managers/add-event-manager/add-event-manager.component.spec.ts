import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEventManagerComponent } from './add-event-manager.component';

describe('AddEventManagerComponent', () => {
  let component: AddEventManagerComponent;
  let fixture: ComponentFixture<AddEventManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEventManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEventManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
