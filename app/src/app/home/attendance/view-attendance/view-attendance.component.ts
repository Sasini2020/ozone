import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {EMPTY, Subject, Subscription} from 'rxjs';
import {MatSort} from '@angular/material/sort';
import {DataService} from '../../../_services/data.service';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AttendanceDialogComponent} from '../module-attendance/module-attendance.component';

import {glow, YEARS} from '../../../_services/shared.service';

interface Attendance {
  moduleCode: string;
  moduleName: string;
  studentIndex: string;
  type: string;
  typeID: number;
  dateHeld: Date;
  sessionID: number;
  academicYear: number;
  attendance: number;
}

@Component({
  selector: 'app-view-attendance',
  templateUrl: './view-attendance.component.html',
  styleUrls: ['./view-attendance.component.css']
})
export class ViewAttendanceComponent implements OnInit {

  years = YEARS;

  viewAttendanceProgress = false;
  success = false;
  notFound = false;

  error = '';
  enteredKeyword = 0;

  viewAttendanceForm: FormGroup;
  attendance: Attendance[];

  displayedColumnsStudent = ['no', 'moduleCode', 'moduleName', 'type', 'academicYear', 'attendance', 'details'];
  displayedColumnsModule = ['no', 'type', 'dateHeld', 'academicYear', 'attendance', 'details'];
  displayedColumns: string[] = this.displayedColumnsStudent;
  dataSource: MatTableDataSource<Attendance>;

  termModuleCode$ = new Subject<string>();
  private searchModuleCode: Subscription;

  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('filter') filter;

  constructor(
    private formBuilder: FormBuilder,
    private data: DataService,
    private elementRef: ElementRef,
    private dialog: MatDialog
  ) {

    this.searchModuleCode = this.termModuleCode$.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap(keyword => {
        this.checkKeyWord(keyword);
        return EMPTY;
      })
    ).subscribe();

    this.viewAttendanceForm = this.formBuilder.group({
      keyword: ['', [Validators.pattern(/^([A-Za-z]{2}[0-9]{4})|([0-9]{6}[A-Za-z])$/)]],
      moduleCodeStudentID: [''],
      course: [''],
      academicYear: ['']
    });
  }

  ngOnInit(): void {
  }

  checkKeyWord(keyword: string): void {
    this.error = '';
    this.enteredKeyword = 0;
    this.success = false;
    this.notFound = false;
    if (keyword) {
      this.data.checkKeyword(keyword).subscribe(
        response => {
          if (response.status) {
            if (response.hasOwnProperty('moduleName')) {
              this.enteredKeyword = 2;
              this.moduleCodeStudentID.setValue(response.moduleName);
            } else if (response.hasOwnProperty('studentName')) {
              this.moduleCodeStudentID.setValue(response.studentName);
              this.course.setValue(response.course);
              this.academicYear.setValue(response.academicYear.toString());
              this.enteredKeyword = 1;
            }
          } else {
            this.moduleCodeStudentID.setValue('');
            this.notFound = true;
          }
        },
        error => {
          this.error = error;
        }
      ).add(() => this.viewAttendanceProgress = false);
    } else {
      this.moduleCodeStudentID.setValue('');
      this.viewAttendanceProgress = false;
    }
  }

  getAttendance() {

    if (this.enteredKeyword === 1) {
      this.data.getStudentAttendance(this.keyword.value).subscribe(
        response => {
          this.attendance = response.attendance ? response.attendance as [] : [];
          this.displayedColumns = this.displayedColumnsStudent;
          this.dataSource = new MatTableDataSource<Attendance>(this.attendance);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          glow(this.elementRef, 'view_attendance', 'rgb(0,50,255)');
        },
        error => {
          this.error = error;
        }
      );
    } else if (this.enteredKeyword === 2) {
      this.data.getModuleAttendance(this.keyword.value).subscribe(
        response => {
          this.attendance = response.attendance ? response.attendance as [] : [];
          this.displayedColumns = this.displayedColumnsModule;
          this.dataSource = new MatTableDataSource<Attendance>(this.attendance);
          this.dataSource.sort = this.sort;
          glow(this.elementRef, 'view_attendance', 'rgb(0,50,255)');
        },
        error => {
          this.error = error;
        }
      );
    } else {
      this.elementRef.nativeElement.querySelector('#keyword').focus();
      return;
    }

  }

  getDetailedAttendance(row: Attendance): void {
    this.viewAttendanceProgress = true;
    if (this.enteredKeyword === 1) {
      this.data.getDetailedStudentAttendance({
        studentID: this.keyword.value,
        moduleCode: row.moduleCode,
        type: row.type,
        academicYear: row.academicYear
      }).subscribe(
        response => {
          this.openStudentAttendanceDialog({
            moduleCode: row.moduleCode,
            moduleName: row.moduleName,
            type: row.type,
            bacth: row.academicYear,
            attendance: response.attendance
          });
        },
        error => this.error = error
      ).add(() => this.viewAttendanceProgress = false);
    } else if (this.enteredKeyword === 2) {
      this.data.getDetailedModuleAttendance({
        moduleCode: this.keyword.value,
        type: row.type,
        sessionID: row.sessionID,
        academicYear: row.academicYear
      }).subscribe(
        response => {
          console.log(row);
          this.openModuleAttendanceDialog({
              moduleCode: this.keyword.value,
              moduleName: this.moduleCodeStudentID.value,
              type: row.type,
              dateHeld: row.dateHeld,
              batch: row.academicYear,
              attendance: response.attendance
            });
        },
        error => {
          this.error = error;
        }
      ).add(() => this.viewAttendanceProgress = false);
    }
  }

  openStudentAttendanceDialog(data: object): void {
    this.dialog.open(AttendanceDialogComponent, {
      width: '500px',
      maxHeight: '700px',
      data
    });
  }

  openModuleAttendanceDialog(data: object): void {
    this.dialog.open(DetailedModuleAttendanceComponent, {
      width: '500px',
      maxHeight: '700px',
      data
    });
  }

  camelCaseToTitleCase(text: string): string {
    const attendance = text ? text.replace(/([A-Z])/g, ' $1') : ' ';
    return attendance.charAt(0).toUpperCase() + attendance.slice(1);
  }

  applyFilter(event, key: number): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource = new MatTableDataSource<Attendance>(this.attendance.filter(
      attendance => attendance[this.displayedColumns[key]].toString().toLowerCase().includes(filterValue.toLowerCase())
    ));
  }

  toggleProgress(): void {
    this.viewAttendanceProgress = true;
  }

  get keyword(): AbstractControl {
    return this.viewAttendanceForm.get('keyword');
  }

  get moduleCodeStudentID(): AbstractControl {
    return this.viewAttendanceForm.get('moduleCodeStudentID');
  }

  get course(): AbstractControl {
    return this.viewAttendanceForm.get('course');
  }

  get academicYear(): AbstractControl {
    return this.viewAttendanceForm.get('academicYear');
  }

}

export interface DetailedModuleAttendance {
  moduleCode: string;
  moduleName: string;
  dateHeld: Date;
  type: string;
  batch: number;
  attendance: {
    studentID: string
    status: boolean;
  }[];
}

@Component({
  selector: 'app-detailed-module-attendance-dialog',
  templateUrl: './detailed-module-attendance.component.html',
  styleUrls: ['./../../attendance/attendance.component.css', './view-attendance.component.css']
})

export class DetailedModuleAttendanceComponent implements OnInit {

  error = false;
  progress = false;

  constructor(
    public dialogRef: MatDialogRef<DetailedModuleAttendanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DetailedModuleAttendance
  ) {
  }

  ngOnInit() {
  }

  onNoClick() {
    this.dialogRef.close();
  }

}
