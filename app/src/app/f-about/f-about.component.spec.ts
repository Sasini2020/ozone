import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FAboutComponent } from './f-about.component';

describe('FAboutComponent', () => {
  let component: FAboutComponent;
  let fixture: ComponentFixture<FAboutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FAboutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
