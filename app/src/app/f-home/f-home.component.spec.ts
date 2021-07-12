import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FHomeComponent } from './f-home.component';

describe('FHomeComponent', () => {
  let component: FHomeComponent;
  let fixture: ComponentFixture<FHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
