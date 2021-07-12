import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FTeachersComponent } from './f-teachers.component';

describe('FTeachersComponent', () => {
  let component: FTeachersComponent;
  let fixture: ComponentFixture<FTeachersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FTeachersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FTeachersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
