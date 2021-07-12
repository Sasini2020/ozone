import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EMPTY, Subject, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {DataService} from '../../../_services/data.service';
import {glow, YEARS} from '../../../_services/shared.service';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {ActivatedRoute} from '@angular/router';

interface Result {
  moduleCode: string;
  moduleName: string;
  studentIndex: string;
  academicYear: number;
  dateHeld: Date;
  mark: number;
  grade: string;
  semester: number;
}

@Component({
  selector: 'app-view-result',
  templateUrl: './view-result.component.html',
  styleUrls: ['./view-result.component.css']
})

export class ViewResultComponent implements OnInit {

  years = YEARS;

  viewResultsProgress = false;
  success = false;
  notFound = false;

  error = '';
  enteredKeyword = 0;

  viewResultsForm: FormGroup;
  results: Result[] = [];

  displayedColumnsStudent = ['no', 'moduleCode', 'moduleName', 'dateHeld', 'academicYear', 'mark', 'grade'];
  displayedColumnsModule = ['no', 'studentIndex', 'dateHeld', 'academicYear', 'mark', 'grade'];
  displayedColumns: string[] = this.displayedColumnsStudent;
  dataSource: MatTableDataSource<Result>;

  termModuleCode$ = new Subject<string>();
  private searchModuleCode: Subscription;

  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild('filter') filter;

  constructor(
    private formBuilder: FormBuilder,
    private data: DataService,
    private elementRef: ElementRef,
    private route: ActivatedRoute
  ) {

    this.searchModuleCode = this.termModuleCode$.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap(keyword => {
        this.checkKeyWord(keyword);
        return EMPTY;
      })
    ).subscribe();

    this.viewResultsForm = this.formBuilder.group({
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
      ).add(() => this.viewResultsProgress = false);
    } else {
      this.moduleCodeStudentID.setValue('');
      this.viewResultsProgress = false;
    }
  }

  getResults() {

    if (this.enteredKeyword === 1) {
      this.data.getResults(this.keyword.value).subscribe(
        response => {
          this.results = response.results ? response.results as [] : [];
          this.displayedColumns = this.displayedColumnsStudent;
          this.dataSource = new MatTableDataSource<Result>(this.results);
          this.dataSource.sort = this.sort;
          glow(this.elementRef, 'view_results', 'rgb(0,50,255)');
        },
        error => {
          this.error = error;
        }
      );
    } else if (this.enteredKeyword === 2) {
      this.data.getModuleResults(this.keyword.value).subscribe(
        response => {
          this.results = response.results ? response.results as [] : [];
          this.displayedColumns = this.displayedColumnsModule;
          this.dataSource = new MatTableDataSource<Result>(this.results);
          this.dataSource.sort = this.sort;
          glow(this.elementRef, 'view_results', 'rgb(0,50,255)');
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

  camelCaseToTitleCase(text: string): string {
    const result = text ? text.replace(/([A-Z])/g, ' $1') : ' ';
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  applyFilter(event, key: number): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource = new MatTableDataSource<Result>(this.results.filter(
      result =>  result[this.displayedColumns[key]].toString().toLowerCase().includes(filterValue.toLowerCase())
    ));
  }

  toggleProgress(): void {
    this.viewResultsProgress = true;
  }

  get keyword(): AbstractControl {
    return this.viewResultsForm.get('keyword');
  }

  get moduleCodeStudentID(): AbstractControl {
    return this.viewResultsForm.get('moduleCodeStudentID');
  }

  get course(): AbstractControl {
    return this.viewResultsForm.get('course');
  }

  get academicYear(): AbstractControl {
    return this.viewResultsForm.get('academicYear');
  }

}
