import {Component, ElementRef, ViewChild, Inject, OnInit, AfterViewInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataService} from '../../../_services/data.service';
import {EMPTY, Subject, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, switchMap} from 'rxjs/operators';
import {COMMA, ENTER, TAB} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {scrollToFirstInvalidElement, YEARS} from '../../../_services/shared.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';

export interface Student {
  studentID: string;
  firstName: string;
  lastName: string;
}

export interface Module {
  moduleCode: string;
  moduleName: string;
}

@Component({
  selector: 'app-enroll',
  templateUrl: './enroll.component.html',
  styleUrls: ['./enroll.component.css', '../course-module.component.css']
})
export class EnrollComponent implements OnInit, AfterViewInit {

  enrollProgress = false;
  studentIDNotFound = false;
  success = false;

  academicYears;

  error = '';
  separatorKeysCodes = [ENTER, COMMA, TAB];

  enrollmentForm: FormGroup;
  term$ = new Subject<string>();
  private searchSubscription: Subscription;

  filteredModules: Observable<Module[]>;
  modules: Module[] = [];
  allModules: Module[] = [];

  new = true;
  enrollmentID: number;

  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('formRef') formRef;

  constructor(
    private formBuilder: FormBuilder,
    private data: DataService,
    private elementRef: ElementRef,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {

    this.searchSubscription = this.term$.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap(studentID => {
        this.error = '';
        this.success = false;
        this.studentIDNotFound = false;
        this.checkStudentID(studentID);
        return EMPTY;
      })
    ).subscribe();

    this.enrollmentForm = this.formBuilder.group({
      studentID: ['', [Validators.required, Validators.pattern(/^[0-9]{6}[A-Za-z]$/)]],
      studentName: ['', Validators.required],
      course: ['', Validators.required],
      semester: ['', Validators.required],
      academicYear: ['', Validators.required],
      inputModule: ['']
    });

    this.filteredModules = this.inputModule.valueChanges.pipe(
      startWith(null),
      map((module: string | null) => module ? this._filter(module) : this.allModules.slice())
    );

  }

  ngOnInit(): void {

    this.enrollProgress = true;
    this.data.getModules().subscribe(
      response => {
        this.allModules = response.modules.map(module => {
          return {
            moduleCode: module.moduleCode,
            moduleName: module.moduleName
          };
        });
        console.log(true);
        this.route.params.subscribe(params => {
          if (params.studentID && params.semester && params.academicYear) {
            this.enrollProgress = true;
            this.enrollmentID = params.enrollmentID;
            this.studentID.setValue(params.studentID);
            this.checkStudentID(params.studentID);
            this.semester.setValue(parseInt(params.semester, 10));
            this.academicYear.setValue(params.academicYear);
            for (const moduleCode of params.modules.split(/,/)) {
              this.modules.push(this.allModules.find(value => value.moduleCode === moduleCode));
            }
            this.new = false;
          }
        });
      },
      error => this.error = error
    ).add(() => this.enrollProgress = false);

    this.data.getAcademicYears().subscribe(
      response => {
        this.academicYears = response.academicYears;
      },
      error => this.error = error
    );

  }

  ngAfterViewInit() {
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.modules.push(this.allModules.find(
        module => module.moduleCode.toLowerCase() === value.toLowerCase() || module.moduleName.toLowerCase() === value.toLowerCase())
      );
    }

    if (input) {
      input.value = '';
    }

    this.inputModule.setValue(null);
  }

  remove(module: Module): void {
    const index = this.modules.indexOf(module);

    if (index >= 0) {
      this.modules.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (!this.modules.find(module => module.moduleCode === event.option.value)) {
      this.modules.push(this.allModules.find(module => module.moduleCode === event.option.value));
    } else {
      this.snackBar.open('Module already added', 'Close', {duration: 2000});
    }
    this.fruitInput.nativeElement.value = '';
    this.inputModule.setValue(null);
  }

  private _filter(value: string): Module[] {
    const filterValue = value.toLowerCase();
    return this.allModules.filter(
      module => module.moduleName.toLowerCase().includes(filterValue) || module.moduleCode.toLowerCase().includes(filterValue)
    );
  }

  checkStudentID(studentID: string) {
    if (studentID) {
      this.data.checkStudentID(studentID).subscribe(
        response => {
          if (response.status) {
            this.studentName.setValue(response.name);
            this.course.setValue(response.course);
            this.academicYear.setValue(response.academicYear);
          } else {
            this.studentName.setValue('');
            this.course.setValue('');
            this.academicYear.setValue('');
            this.studentIDNotFound = true;
          }
        },
        error => this.error = error
      ).add(() => this.enrollProgress = false);
    } else {
      this.enrollProgress = false;
    }
  }

  resetForm(): void {
    this.formRef.resetForm();
    this.new = true;
    this.enrollmentID  = null;
    setTimeout(() => this.enrollProgress = false, 200);
    this.modules = [];
  }

  submitForm(): void {
    this.success = false;
    this.error = '';
    if (this.enrollmentForm.valid) {
      if (this.modules.length > 0) {
        if (confirm('Are you sure you want to submit the form?')) {
          this.enrollProgress = true;
          const request = this.enrollmentForm.value;
          request.enrollmentID = this.enrollmentID ? this.enrollmentID : 0;
          request.modules = this.modules;
          request.new = this.new;
          this.data.enrollStudent(request).subscribe(
            response => {
              this.router.navigate(['../view-enrollments'], {relativeTo: this.route}).then(
                () => this.snackBar.open(`Enrollment ${this.new ? 'added' : 'updated'} successfully`, 'Close', {duration: 3000})
              );
            }, error => this.error = error
          ).add(() => this.enrollProgress = false);
        }
      } else {
        this.elementRef.nativeElement.querySelector('#add-modules').scrollIntoView({behavior: 'smooth'});
      }
    } else {
      scrollToFirstInvalidElement(this.elementRef);
    }
  }

  toggleProgress() {
    this.enrollProgress = true;
  }

  get studentID() {
    return this.enrollmentForm.get('studentID');
  }

  get studentName() {
    return this.enrollmentForm.get('studentName');
  }

  get course() {
    return this.enrollmentForm.get('course');
  }

  get semester() {
    return this.enrollmentForm.get('semester');
  }

  get academicYear() {
    return this.enrollmentForm.get('academicYear');
  }

  get inputModule() {
    return this.enrollmentForm.get('inputModule');
  }

}
