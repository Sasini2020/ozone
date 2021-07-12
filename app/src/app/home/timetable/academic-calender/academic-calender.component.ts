import {Component, HostListener, OnInit, ViewEncapsulation} from '@angular/core';
import {ToolbarItem, EditSettingsModel, Column} from '@syncfusion/ej2-angular-gantt';
import {DataService} from '../../../_services/data.service';
import {AuthenticationService} from '../../../_services/authentication.service';
import * as _ from 'lodash';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormControl, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import 'rxjs/add/observable/of';


@Component({
  selector: 'app-academic-calender',
  templateUrl: './academic-calender.component.html',
  styleUrls: ['./academic-calender.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AcademicCalenderComponent implements OnInit {

  public originalData = [];
  public academicCalenders = [];
  public taskSettings: object;
  public timelineSettings: object;
  public editSettings: EditSettingsModel;
  public toolbar: ToolbarItem[];


  enableEdit: boolean;
  error = '';
  success = false;

  constructor(
    private data: DataService,
    private authentication: AuthenticationService,
    public dialog: MatDialog
  ) {
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.enableEdit) {
      const result = window.confirm('Unsaved changes will be discarded.');
      return Observable.of(result);
    }
    return true;
  }

  public ngOnInit(): void {
    this.data.getAcademicCalenders().subscribe(
      response => {
        this.originalData = response.academicCalenders;
        console.log(this.originalData);
        this.academicCalenders = _.cloneDeep(this.originalData);
      },
      error => {
        console.error(error);
        this.error = error;
      }
    );
    this.taskSettings = {
      id: 'ID',
      name: 'TaskName',
      startDate: 'StartDate',
      endDate: 'EndDate'
    };
    this.editSettings = {
      allowAdding: true,
      allowEditing: true,
      allowDeleting: true,
      allowTaskbarEditing: true,
      showDeleteConfirmDialog: true
    };
    this.toolbar = ['Add', 'Edit', 'Update', 'Delete', 'Cancel'];
    this.timelineSettings = {
      timelineViewMode: 'Year',
      timelineUnitSize: 70
    };
  }

  saveChanges(value: boolean): void {
    this.success = false;
    this.error = '';
    if (value) {
      this.originalData = _.cloneDeep(this.academicCalenders);
      this.enableEdit = false;
      this.data.updateAcademicCalender(this.academicCalenders).subscribe(
        response => {
          console.log(response);
          this.success = true;
        },
        error => {
          this.error = error;
          console.error(error);
        }
      );
    } else {
      this.academicCalenders = _.cloneDeep(this.originalData);
      this.enableEdit = false;
    }
  }

  openDialog(): void {
    this.error = '';
    const dialogRef = this.dialog.open(NewAcademicYearDialogComponent, {
      width: '250px'
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        const academicYear = parseInt(data, 10);
        if (this.academicCalenders.filter(obj => obj.year === academicYear).length === 0) {
          this.academicCalenders.unshift({
            year: academicYear,
            data: []
          });
        } else {
          this.error = 'Academic year you entered already exists';
        }
      }
    });
  }

  get getRole(): string {
    return this.authentication.details.role;
  }

}

@Component({
  selector: 'app-new-academic-year-dialog',
  templateUrl: './new-academic-year-dialog.html',
  styleUrls: ['./academic-calender.component.css']
})

export class NewAcademicYearDialogComponent implements OnInit {

  academicYear = new FormControl('', [Validators.pattern(/^[0-9]*$/)]);

  constructor(
    public dialogRef: MatDialogRef<NewAcademicYearDialogComponent>
  ) {
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.academicYear.valid) {
      this.dialogRef.close(this.academicYear.value);
    }
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

}
