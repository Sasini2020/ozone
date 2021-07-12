import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FClassComponent } from './f-class.component';

describe('FClassComponent', () => {
  let component: FClassComponent;
  let fixture: ComponentFixture<FClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FClassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
