import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {DataService} from '../../../_services/data.service';
import {AuthenticationService} from '../../../_services/authentication.service';
import {EMPTY, Subject, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {Session} from '../attendance.component';
import {glow} from '../../../_services/shared.service';

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
export class EditAttendanceComponent implements OnInit, OnDestroy {

  academicYears = [2016, 2017, 2018, 2019, 2020];

  lectureHours = [];
  attendance = [];
  modifiedAttendance: ModifiedAttendance[] = [];
  filteredAttendance: ModifiedAttendance[] = [];
  sessions: Session[];
  previousModuleCode: string;
  sessionID: number;
  error = '';

  editAttendanceForm: FormGroup;
  term$ = new Subject<string>();
  private searchSubscription: Subscription;

  editAttendanceProgress = false;
  buttonProgress = false;
  sessionsFound = true;
  lectureHoursFound = true;
  successfullySaved = false;
  updated = false;

  constructor(
    private router: Router,
    private data: DataService,
    private formBuilder: FormBuilder,
    private authentication: AuthenticationService,
    private elementRef: ElementRef
  ) {
    this.searchSubscription = this.term$.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap(moduleCode => {
        this.getLectureHours(moduleCode);
        return EMPTY;
      })
    ).subscribe();
  }

  ngOnInit(): void {

    this.editAttendanceForm = this.formBuilder.group({
      moduleCode: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}[0-9]{4}/)]],
      moduleName: [],
      lectureHour: [{value: '', disabled: true}, [Validators.required]],
      batch: [{value: '', disabled: true}, [Validators.required]],
      session: [{value: '', disabled: true}, [Validators.required]]
    });

    this.editAttendanceProgress = true;
    this.data.getAcademicYears().subscribe(
      response => this.academicYears = response.academicYears,
        error => this.error = error
    ).add(() => this.editAttendanceProgress = false);

  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
      this.searchSubscription = null;
    }
  }

  getLectureHours(moduleCode: string) {
    this.successfullySaved = false;
    this.sessionsFound = true;
    this.lectureHoursFound = true;
    this.error = '';
    this.lectureHour.disable();
    this.batch.disable();
    this.session.disable();
    if (moduleCode && moduleCode !== this.previousModuleCode) {
      this.editAttendanceProgress = true;
      this.data.getLectureHoursOfModule(moduleCode).subscribe(
        response => {
          if (response.status) {
            this.moduleName.setValue(response.moduleName);
            this.lectureHours = response.lectureHours;
            this.lectureHoursFound = (this.lectureHours.length !== 0);
            this.lectureHour.reset();
            if (this.lectureHoursFound) {
              this.lectureHour.enable();
              this.elementRef.nativeElement.querySelector('#lectureHour').focus();
            } else {
              this.lectureHour.disable();
            }
          } else {
            this.lectureHour.disable();
            this.moduleCode.markAsDirty();
            this.moduleCode.setErrors({incorrect: false});
            this.moduleName.reset();
          }
        },
        error => {
          this.lectureHour.disable();
        }
      ).add(() => {
        this.session.disable();
        this.session.reset();
        this.editAttendanceProgress = false;
        this.previousModuleCode = moduleCode;
      });
    }
  }

  getBatch() {
    this.session.disable();
    this.batch.enable();
    this.elementRef.nativeElement.querySelector('#batch').focus();
    this.batch.reset();
  }

  getSession() {
    this.error = '';
    this.editAttendanceProgress = true;
    this.session.disable();
    this.data.getSessions(this.lectureHour.value, this.batch.value).subscribe(
      response => {
        console.log(response);
        this.sessions = response.sessions;
        this.sessions.sort((date1, date2) => date1 > date2 ? 1 : -1);
        this.sessionsFound = this.sessions.length !== 0;
        if (this.sessionsFound) {
          this.batch.enable();
          this.session.enable();
          this.session.reset();
          this.elementRef.nativeElement.querySelector('#session').focus();
        }
      },
      error => console.error(error)
    ).add(() => this.editAttendanceProgress = false);
  }

  getAttendance() {
    this.error = '';
    this.successfullySaved = false;
    let res = true;
    if (this.updated && this.attendance.length !== 0) {
      res = confirm('Are you sure you want to discard changes made?');
    }

    if (res) {
      this.sessionID = this.session.value;
      this.editAttendanceProgress = true;
      this.updated = false;
      this.modifiedAttendance = [];
      this.error = '';
      this.data.getAttendanceOfSession(this.session.value).subscribe(
        response => {
          this.attendance = response.attendance;
          this.attendance.forEach((record, i) => {
            this.modifiedAttendance.push({
              index: i,
              studentID: record.StudentID,
              status: record.status === 'Present',
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
      this.data.saveAttendanceChanges(updatedAttendance, this.sessionID).subscribe(
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
    this.editAttendanceProgress = this.moduleCode.value !== '';
  }

  get moduleCode() {
    return this.editAttendanceForm.get('moduleCode');
  }

  get moduleName(): AbstractControl {
    return this.editAttendanceForm.get('moduleName');
  }

  get lectureHour() {
    return this.editAttendanceForm.get('lectureHour');
  }

  get batch() {
    return this.editAttendanceForm.get('batch');
  }

  get session() {
    return this.editAttendanceForm.get('session');
  }

  get studentID() {
    return this.editAttendanceForm.get('studentID');
  }

}
