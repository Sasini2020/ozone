import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassregistrationComponent } from './classregistration.component';

describe('ClassregistrationComponent', () => {
  let component: ClassregistrationComponent;
  let fixture: ComponentFixture<ClassregistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassregistrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassregistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
