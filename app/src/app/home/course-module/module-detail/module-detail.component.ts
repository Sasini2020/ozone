import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {DataService} from '../../../_services/data.service';
import {AuthenticationService} from '../../../_services/authentication.service';
import {DAYS_OF_WEEK} from '../course-module.component';
import {glow} from '../../../_services/shared.service';
import {FormControl} from '@angular/forms';

export interface Class {
  classID: string;
  moduleCode: string;
  moduleName: string;
  description: string;
  year: number;
  time: string;
  duration: number;
  teachers: string[];
}

@Component({
  selector: 'app-module-detail',
  templateUrl: './module-detail.component.html',
  styleUrls: ['./module-detail.component.css', '../course-module.component.css']
})
export class ModuleDetailComponent implements OnInit, AfterViewInit {

  progress = false;

  error = '';
  courseName = '';

  filteredClasses: Class[] = [];
  classes: Class[] = [];

  filter: FormControl = new FormControl('');
  classID: string;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public dialog: MatDialog,
    private data: DataService,
    private authentication: AuthenticationService,
    private elementRef: ElementRef
  ) {
    this.filter.valueChanges.subscribe(value => this._filter(value));
  }

  ngOnInit(): void {
    this.progress = false;
  }

  ngAfterViewInit() {
    this.route.params.subscribe(params => {
      this.classID = params.classID;
      this.getData();
    });
  }

  getData() {
    this.progress = true;
    Object.assign(this.filteredClasses, this.classes);
    this.data.getClasses().subscribe(
      response => {
        this.classes = response.classes;
        Object.assign(this.filteredClasses, this.classes);
      },
      error => {
        this.error = error;
      }
    ).add(
      () => {
        this.progress = false;
        if (!this.error) {
          setTimeout(() => {
            try {
              document.querySelector(`#card${this.classID}`).scrollIntoView({behavior: 'smooth'});
              glow(this.elementRef, 'card' + this.classID, 'rgb(100, 60, 180)');
            } catch (exception) {
            }
          }, 200);
        }
      }
    );
  }

  _filter(value: string): void {
    const filterValue = value ? value.trim().toLowerCase() : '';
    if (filterValue) {
      this.filteredClasses = this.classes.filter(
        _class => _class.moduleName.toLowerCase().includes(filterValue) || _class.moduleCode.toLowerCase().includes(filterValue)
      );
    } else {
      this.filteredClasses = this.classes;
    }
  }

  navigateToResult(classID: string): void {
    if (this.getRole === 'Student') {
      this.router.navigate(['../../results/exam-results', {classID}], {relativeTo: this.route});
    } else {
      this.router.navigate(['../../results/view-results', {classID}], {relativeTo: this.route});
    }
  }

  navigateToAttendance(classID: string): void {
    if (this.getRole === 'Student') {
      this.router.navigate(['../../attendance/module-attendance', {classID}], {relativeTo: this.route});
    } else {
      this.router.navigate(['../../attendance/view-attendance', {classID}], {relativeTo: this.route});
    }
  }

  get getRole() {
    return this.authentication.details.role;
  }

  get daysOfWeek() {
    return DAYS_OF_WEEK;
  }

}
