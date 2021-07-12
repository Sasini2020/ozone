import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FAchievementComponent } from './f-achievement.component';

describe('FAchievementComponent', () => {
  let component: FAchievementComponent;
  let fixture: ComponentFixture<FAchievementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FAchievementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FAchievementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
