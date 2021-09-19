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

export interface Session {
  classID: number;
  moduleCode: string;
  moduleName: string;
  year: number;
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

  filteredClasses: Observable<Session[]>;
  classes: Session[] = [];
  allClasses: Session[] = [];

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
      studentID: ['', [Validators.required, Validators.pattern(/^[A-Z][0-9]{6}$/)]],
      studentName: ['', Validators.required],
      academicYear: ['', Validators.required],
      inputModule: ['']
    });

    this.filteredClasses = this.inputModule.valueChanges.pipe(
      startWith(null),
      map((session: string | null) => session ? this._filter(session) : this.allClasses.slice())
    );

  }

  ngOnInit(): void {

    this.enrollProgress = true;
    this.data.getClasses().subscribe(
      response => {
        this.allClasses = response.classes.map(session => {
          return {
            classID: session.classID,
            moduleCode: session.moduleCode,
            moduleName: session.moduleName,
            year: session.year
          };
        });

        this.route.params.subscribe(params => {
          this.studentID.setValue(params.studentID);
          this.checkStudentID(params.studentID);
        });
      },
      error => this.error = error
    ).add(() => this.enrollProgress = false);

  }

  ngAfterViewInit() {
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.classes.push(this.allClasses.find(
        module => module.moduleCode.toLowerCase() === value.toLowerCase() || module.moduleName.toLowerCase() === value.toLowerCase())
      );
    }

    if (input) {
      input.value = '';
    }

    this.inputModule.setValue(null);
  }

  remove(module: Session): void {
    const index = this.classes.indexOf(module);

    if (index >= 0) {
      this.classes.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (!this.classes.find(session => session.classID === event.option.value)) {
      this.classes.push(this.allClasses.find(session => session.classID === event.option.value));
    } else {
      this.snackBar.open('Module already added', 'Close', {duration: 2000});
    }
    this.fruitInput.nativeElement.value = '';
    this.inputModule.setValue(null);
  }

  private _filter(value: string): Session[] {
    if (value) {
      const filterValue = value.toString().toLowerCase();
      return this.allClasses.filter(
        module => module.moduleName.toLowerCase().includes(filterValue) || module.moduleCode.toLowerCase().includes(filterValue)
      );
    }
  }

  checkStudentID(studentID: string) {
    if (studentID) {
      this.data.checkStudentID(studentID).subscribe(
        response => {
          if (response.status) {
            this.studentName.setValue(response.studentDetails.studentName);
            this.academicYear.setValue(response.studentDetails.year + '');
            this.classes = [];
            for (const se of response.classes) {
              this.classes.push(this.allClasses.find(session => session.classID === se.classID));
            }
          } else {
            this.studentName.setValue('');
            this.academicYear.setValue('');
            this.studentIDNotFound = true;
            this.classes = [];
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
    this.enrollmentID = null;
    setTimeout(() => this.enrollProgress = false, 200);
    this.classes = [];
  }

  submitForm(): void {
    this.success = false;
    this.error = '';
    if (this.enrollmentForm.valid) {
      if (this.classes.length > 0) {
        if (confirm('Are you sure you want to submit the form?')) {
          this.enrollProgress = true;
          const request = this.enrollmentForm.value;
          request.enrollmentID = this.enrollmentID ? this.enrollmentID : 0;
          request.classes = this.classes;
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

  get academicYear() {
    return this.enrollmentForm.get('academicYear');
  }

  get inputModule() {
    return this.enrollmentForm.get('inputModule');
  }

}
