import {Component, ElementRef, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataService} from '../../../_services/data.service';
import {FormBuilder, FormControl} from '@angular/forms';
import {AuthenticationService} from '../../../_services/authentication.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Attendance, DetailedAttendance} from '../attendance.component';
import {glow} from '../../../_services/shared.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {HomeComponent} from '../../home.component';

@Component({
  selector: 'app-module-attendance',
  templateUrl: './module-attendance.component.html',
  styleUrls: ['./../attendance.component.css']
})
export class ModuleAttendanceComponent implements OnInit {

  moduleCode: string;

  attendance: Attendance[] = [];
  filteredAttendance: Attendance[] = [];
  detailedAttendance: DetailedAttendance;
  filter: FormControl = new FormControl('');

  progress = false;
  attendanceError = '';

  constructor(
    private router: Router,
    private data: DataService,
    private formBuilder: FormBuilder,
    private authentication: AuthenticationService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private elementRef: ElementRef,
    private snackBar: MatSnackBar
  ) {
    if (this.getRole !== 'Student') {
      router.navigate(['../view-attendance'], {relativeTo: this.route});
    }
  }

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      this.moduleCode = params.moduleCode;
    });

    this.filter.valueChanges.subscribe(value => {
      this.filteredAttendance = Object.assign([], this.filterAttendance(value));
    });

    this.progress = true;
    this.data.getAttendance().subscribe(
      response => this.getAttendance(response.attendance),
      error => this.attendanceError = error
    ).add(() => {
      this.progress = false;
      if (this.moduleCode) {
        setTimeout(() => {
          try {
            const element = this.elementRef.nativeElement.querySelector(`[id^='${this.moduleCode}']`);
            if (element) {
              element.scrollIntoView({behavior: 'smooth'});
              element.style.boxShadow = '0 0 0 2px purple';
              setTimeout(
                () => element.style.boxShadow = '0 0 0 2px white',
                2000
              );
            } else {
              this.snackBar.open(`No Attendance Details Available for ${this.moduleCode}`, 'Close', {duration: 4000});
            }
          } catch (exception) {
          }
        }, 500);
      }
    });
  }

  filterAttendance(value: string): Attendance[] {
    const filterValue = value.toLowerCase();
    return this.attendance.filter(
      attendance => attendance.moduleCode.toLowerCase().includes(filterValue) || attendance.moduleName.toLowerCase().includes(filterValue)
    );
  }

  getAttendance(response) {
    for (const attendance of response) {
      const temp = this.attendance.find(value => value.moduleCode === attendance.moduleCode);
      if (temp !== undefined) {
        temp.attendance.push({
          batch: attendance.batch,
          type: attendance.type,
          percentage: this.calculateAttendance(attendance.total, attendance.count)
        });
      } else {
        this.attendance.push({
          moduleCode: attendance.moduleCode,
          moduleName: attendance.moduleName,
          attendance: [{
            batch: attendance.batch,
            type: attendance.type,
            percentage: this.calculateAttendance(attendance.total, attendance.count)
          }]
        });
      }
    }
    Object.assign(this.filteredAttendance, this.attendance);
  }

  calculateAttendance(total, count) {
    return Math.round((total - count) * 100 / total);
  }

  openDialog(moduleCode: string, moduleName: string, type: string, batch: number): void {
    this.detailedAttendance = {
      moduleCode,
      moduleName,
      type,
      batch
    };
    this.dialog.open(AttendanceDialogComponent, {
      width: '500px',
      data: this.detailedAttendance
    });
  }

  get getRole() {
    return this.authentication.details.role;
  }

}


@Component({
  selector: 'app-attendance-dialog',
  templateUrl: './attendance-dialog.component.html',
  styleUrls: ['./../attendance.component.css']
})

export class AttendanceDialogComponent implements OnInit {

  error = false;
  progress = false;

  constructor(
    private dataService: DataService,
    public dialogRef: MatDialogRef<AttendanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DetailedAttendance
  ) {
  }

  ngOnInit() {
    if (!this.data.attendance) {
      this.progress = true;
      this.dataService.getDetailedAttendance(this.data.moduleCode, this.data.type, this.data.batch).subscribe(
        response => {
          this.data.attendance = [];
          for (const session of response) {
            this.data.attendance.push({
              date: session.date,
              status: session.status
            });
          }
        }, error => {
          this.error = true;
        }
      ).add(() => this.progress = false);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

