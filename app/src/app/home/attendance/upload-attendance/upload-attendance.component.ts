import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
import {LectureHour} from '../../course-module/course-module.component';
import {Session} from '../attendance.component';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {DataService} from '../../../_services/data.service';
import {AuthenticationService} from '../../../_services/authentication.service';
import * as XLSX from 'xlsx';
import {EMPTY, Subject, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {glow} from '../../../_services/shared.service';

@Component({
  selector: 'app-upload-attendance',
  templateUrl: './upload-attendance.component.html',
  styleUrls: ['./upload-attendance.component.css', '../attendance.component.css']
})
export class UploadAttendanceComponent implements OnInit, AfterViewInit {

  academicYears = [2016, 2017, 2018, 2019, 2020];

  lectureHours: LectureHour[] = [];
  sessions: Session[] = [];

  uploadAttendanceForm: FormGroup;
  term$ = new Subject<string>();
  private searchSubscription: Subscription;

  moduleError = false;
  fileError = false;
  progress = false;
  uploadAttendanceProgress = false;
  successfullySaved = false;
  lectureHoursFound = true;

  error = '';
  previousModuleCode = '';

  maxDate = new Date();
  attendanceFile;
  file;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
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

    this.uploadAttendanceForm = this.formBuilder.group({
      moduleCode: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}[0-9]{4}/)]],
      moduleName: [''],
      lectureHour: [{value: '', disabled: true}, [Validators.required]],
      batch: [{value: '', disabled: true}, [Validators.required]],
      comment: [''],
      session: [{value: '', disabled: true}, [Validators.required]],
      date: [{value: '', disabled: true}, [Validators.required]],
      time: [{value: '', disabled: true}, [Validators.required]]
    });

    this.uploadAttendanceProgress = true;
    this.data.getAcademicYears().subscribe(
      response => {
        console.log(response);
        this.academicYears = response.academicYears;
      },
      error => this.error = error
    ).add(() => this.uploadAttendanceProgress = false);
  }

  ngAfterViewInit() {
    this.route.params.subscribe(params => {
      if (params.moduleCode) {
        this.moduleCode.setValue(params.moduleCode);
        this.getLectureHours(params.moduleCode);
      }
    });
  }

  getLectureHours(moduleCode: string) {
    this.successfullySaved = false;
    this.lectureHoursFound = true;
    this.error = '';
    this.lectureHour.disable();
    this.batch.disable();
    this.session.disable();
    this.date.disable();
    this.time.disable();
    if (moduleCode && moduleCode !== this.previousModuleCode) {
      this.uploadAttendanceProgress = true;
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
        }, error => {
          this.lectureHour.disable();
        }
      ).add(() => {
        this.session.disable();
        this.session.reset();
        this.uploadAttendanceProgress = false;
        this.previousModuleCode = moduleCode;
      });
    }
  }

  getBatch() {
    this.session.disable();
    this.date.disable();
    this.time.disable();
    this.batch.enable();
    this.elementRef.nativeElement.querySelector('#batch').focus();
    this.batch.reset();
  }

  getSessions() {
    this.uploadAttendanceProgress = true;
    this.session.disable();
    this.date.disable();
    this.time.disable();
    this.session.reset();
    this.data.getSessions(this.lectureHour.value, this.batch.value).subscribe(
      response => {
        this.sessions = response.sessions;
        this.sessions.sort((date1, date2) => date1 > date2 ? 1 : -1);
        this.session.enable();
        this.elementRef.nativeElement.querySelector('#session').focus();
      }, error => {
        this.error = error;
      }
    ).add(() => this.uploadAttendanceProgress = false);
  }

  clickFileUpload() {
    document.getElementById('fileUpload').click();
  }

  checkValue(value) {
    if (parseInt(value, 10) === 0) {
      this.date.enable();
      this.time.enable();
      this.date.reset();
      this.time.reset();
    } else {
      this.date.disable();
      this.time.disable();
    }
  }

  onFileChange(ev) {
    this.uploadAttendanceProgress = true;
    this.attendanceFile = '';
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    this.file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, {type: 'binary'});
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      this.attendanceFile = jsonData.Sheet1;
      let isValid = true;
      if (this.attendanceFile[0].hasOwnProperty('index') && this.attendanceFile[0].hasOwnProperty('status')) {
        for (const attendance of this.attendanceFile) {
          if (attendance.index.toString().match(/^[0-9]{6}[A-Za-z]$/) === null || attendance.status !== 0 && attendance.status !== 1) {
            isValid = false;
            break;
          }
        }
      } else {
        isValid = false;
      }
      if (isValid) {
        this.attendanceFile.sort((a, b) => a.index > b.index ? 1 : -1);
        glow(this.elementRef, 'attendance_preview', 'rgb(100, 60, 180)');
      } else {
        this.attendanceFile = '';
        glow(this.elementRef, 'attendance_preview', 'red');
      }
      this.fileError = !isValid;
    };
    reader.readAsBinaryString(this.file);
    this.uploadAttendanceProgress = false;
    this.elementRef.nativeElement.querySelector('#fileUpload').value = '';
  }

  uploadAttendance() {
    this.error = '';
    this.successfullySaved = false;
    if (confirm('Are sure you want to upload this file?')) {
      if (this.uploadAttendanceForm.valid) {
        if (this.attendanceFile) {
          this.uploadAttendanceProgress = true;
          const data = {
            moduleCode: this.moduleCode.value,
            lectureHourID: this.lectureHour.value,
            batch: parseInt(this.batch.value, 10),
            sessionID: parseInt(this.session.value, 10),
            date: this.date.value,
            time: this.time.value,
            attendance: this.attendanceFile
          };
          this.data.uploadAttendance(data).subscribe(
            response => {
              this.successfullySaved = true;
              glow(this.elementRef, 'attendance_preview', 'rgb(100, 60, 180)');
            },
            error => {
              this.successfullySaved = false;
              this.error = error;
            }
          ).add(() => this.uploadAttendanceProgress = false);
        } else {
          glow(this.elementRef, 'attendance_preview', 'red');
          this.elementRef.nativeElement.querySelector('#messages').scrollIntoView({behavior: 'smooth'});
        }
      } else {
        this.scrollToFirstInvalidControl();
      }
    }
  }

  toggleProgress() {
    this.uploadAttendanceProgress = this.moduleCode.value !== '';
  }

  scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.elementRef.nativeElement.querySelector('form .ng-invalid');
    firstInvalidControl.scrollIntoView({behavior: 'smooth'});
  }

  clearData() {
    this.attendanceFile = '';
    this.uploadAttendanceForm.reset();
    setTimeout(() => this.uploadAttendanceProgress = false, 1000);
  }

  get moduleCode() {
    return this.uploadAttendanceForm.get('moduleCode');
  }

  get moduleName(): AbstractControl {
    return this.uploadAttendanceForm.get('moduleName');
  }

  get lectureHour() {
    return this.uploadAttendanceForm.get('lectureHour');
  }

  get batch() {
    return this.uploadAttendanceForm.get('batch');
  }

  get session() {
    return this.uploadAttendanceForm.get('session');
  }

  get date() {
    return this.uploadAttendanceForm.get('date');
  }

  get time() {
    return this.uploadAttendanceForm.get('time');
  }

}

