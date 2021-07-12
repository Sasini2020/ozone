import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FClassRegistrationComponent } from './f-class-registration.component';

describe('FClassRegistrationComponent', () => {
  let component: FClassRegistrationComponent;
  let fixture: ComponentFixture<FClassRegistrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FClassRegistrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FClassRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
