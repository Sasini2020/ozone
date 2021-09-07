import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {DataService} from '../../../_services/data.service';
import {AuthenticationService} from '../../../_services/authentication.service';
import {EMPTY, Subject, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {Session} from '../attendance.component';
import {glow} from '../../../_services/shared.service';
import {Attendance} from '../view-attendance/view-attendance.component';
import {Class} from '../../course-module/new-module/new-module.component';

export interface ModifiedAttendance {
  index: number;
  studentID: string;
  status: boolean;
  modified: boolean;
}

@Component({
  selector: 'app-edit-attendance',
  templateUrl: './edit-attendance.component.html',
  styleUrls: ['./edit-attendance.component.css', '../attendance.component.css']
})
export class EditAttendanceComponent implements OnInit {

  classes: Class[] = [];
  sessions: Session[] = [];
  attendance: Attendance[] = [];
  modifiedAttendance: ModifiedAttendance[] = [];
  filteredAttendance: ModifiedAttendance[] = [];

  sessionID: number;
  error = '';

  editAttendanceForm: FormGroup;

  editAttendanceProgress = false;
  buttonProgress = false;
  noSessionsFound = false;
  successfullySaved = false;
  updated = false;

  constructor(
    private router: Router,
    private data: DataService,
    private formBuilder: FormBuilder,
    private authentication: AuthenticationService,
    private elementRef: ElementRef
  ) {
  }

  ngOnInit(): void {

    this.editAttendanceForm = this.formBuilder.group({
      _class: ['', Validators.required],
      session: ['', Validators.required]
    });

    this.editAttendanceProgress = true;
    this.data.getClasses().subscribe(
      response => this.classes = response.classes,
      error => this.error = error
    ).add(() => this.editAttendanceProgress = false);

  }

  getSessions() {
    this.successfullySaved = false;
    this.noSessionsFound = false;
    this.error = '';
    this.data.getSessions(this._class.value).subscribe(
      response => {
        this.sessions = response.sessions;
        this.noSessionsFound = this.sessions.length === 0;
      },
      error => {
        this.error = error;
      }
    ).add(() => {
      this.editAttendanceProgress = false;
    });
  }

  getAttendance() {
    this.error = '';
    this.successfullySaved = false;

    let res = true;
    if (this.modifiedAttendance.length !== 0) {
      res = confirm('Are you sure you want to discard changes made?');
    }

    if (res) {
      this.editAttendanceProgress = true;
      this.modifiedAttendance = [];
      this.data.getAttendance(this.session.value).subscribe(
        response => {
          this.attendance = response.attendance;
          console.log(this.attendance);
          this.attendance.forEach((record, i) => {
            this.modifiedAttendance.push({
              index: i,
              studentID: record.studentIndex,
              status: record.status,
              modified: false
            });
            this.filteredAttendance = this.modifiedAttendance;
            this.elementRef.nativeElement.querySelector('#attendance_preview').scrollIntoView({behavior: 'smooth'});
            glow(this.elementRef, 'attendance_preview', 'rgb(100, 60, 180)');
          });
        },
        error => {
          glow(this.elementRef, 'attendance_preview', 'red');
          this.error = error;
        }
      ).add(() => this.editAttendanceProgress = false);
    }
  }

  updateAttendanceRecord(event) {
    this.updated = true;
    const temp = this.modifiedAttendance.find(record => record.index === parseInt(event.target.id.substring(3, 4), 10) - 1);
    temp.modified = !temp.modified;
    temp.status = !temp.status;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    if (filterValue) {
      this.filteredAttendance = this.modifiedAttendance.filter(obj => obj.studentID.toLowerCase().includes(filterValue));
    } else {
      this.filteredAttendance = this.modifiedAttendance;
    }
  }

  resetAttendance() {
    this.modifiedAttendance.forEach(record => {
      if (record.modified) {
        this.updated = false;
        record.status = !record.status;
        record.modified = !record.modified;
      }
    });
  }

  saveChanges() {
    this.error = '';
    this.editAttendanceProgress = true;
    this.buttonProgress = true;
    if (confirm('Are you sure you wand to save changes')) {
      const updatedAttendance = [];
      this.modifiedAttendance.forEach(record => {
        updatedAttendance.push({
          studentID: record.studentID,
          status: record.status
        });
      });
      this.data.modifyAttendance(updatedAttendance, this.session.value).subscribe(
        response => {
          this.successfullySaved = true;
          this.modifiedAttendance.forEach(record => record.modified = false);
          this.updated = false;
          glow(this.elementRef, 'attendance_preview', 'rgb(100, 60, 180)');
        },
        error => {
          glow(this.elementRef, 'attendance_preview', 'red');
          this.error = error;
        }
      ).add(() => {
        this.editAttendanceProgress = false;
        this.buttonProgress = false;
      });
    }
  }

  resetForm(): void {
    this.elementRef.nativeElement.querySelector('#top').scrollIntoView({behavior: 'smooth'});
    this.attendance = [];
    this.filteredAttendance = [];
    this.ngOnInit();
  }

  toggleProgress() {
    this.editAttendanceProgress = this._class.value !== '';
  }

  get _class() {
    return this.editAttendanceForm.get('_class');
  }

  get session() {
    return this.editAttendanceForm.get('session');
  }

}
