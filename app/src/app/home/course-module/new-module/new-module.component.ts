import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {EMPTY, Observable, Subject, Subscription} from 'rxjs';
import {YEARS} from '../../../_services/shared.service';
import {MatAutocomplete} from '@angular/material/autocomplete';
import {DataService} from '../../../_services/data.service';
import {debounceTime, map, startWith, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {DAYS_OF_WEEK, Teacher} from '../course-module.component';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

export interface Class {
  classID: string;
  moduleCode: string;
  moduleName: string;
  description: string;
  year: number;
  day: number;
  time: string;
  duration: number;
  teachers: Teacher[];
  new: boolean;
}

@Component({
  selector: 'app-new-module',
  templateUrl: './new-module.component.html',
  styleUrls: ['./new-module.component.css']
})
export class NewModuleComponent implements OnInit {

  selectable = true;
  removable = true;
  editModuleProgress = false;
  moduleExists = true;

  years = YEARS;
  savingError = '';
  error = '';

  routeParameter: string;
  filteredTeachers: Observable<Teacher[]>;
  teachers: Teacher[] = [];
  allTeachers: Teacher[] = [];
  editClassForm: FormGroup;
  data: Class;
  term$ = new Subject<string>();
  private searchSubscription: Subscription;

  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private elementRef: ElementRef,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.searchSubscription = this.term$.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap(moduleCode => {
        this.checkModule(moduleCode);
        return EMPTY;
      })
    ).subscribe();
  }

  ngOnInit() {

    this.data = {
      classID: '',
      moduleCode: '',
      moduleName: '',
      description: '',
      year: 0,
      day: 0,
      time: '',
      duration: 0,
      teachers: [],
      new: true
    };

    this.editClassForm = this.formBuilder.group({
      moduleCode: ['', [Validators.required, Validators.pattern(/^[A-Z][0-9]{4}$/)]],
      moduleName: ['', [Validators.required, Validators.minLength(6)]],
      description: ['', [Validators.required, Validators.minLength(6)]],
      teacher: [''],
      year: ['', [Validators.required]],
      day: ['', [Validators.required]],
      time: ['', Validators.required],
      duration: ['', [Validators.required, Validators.pattern(/^[1-9]$/)]]
    });


    this.route.params.subscribe(params => {
      if (params.classID) {
        this.getClass(params.classID);
      }
    });

    this.dataService.getTeachers().subscribe(
      response => {
        this.allTeachers = response.teachers;
        this.filteredTeachers = this.editClassForm.get('teacher').valueChanges.pipe(
          startWith(null),
          map((teacher: string | null) => teacher ? this._filter(teacher) : this.allTeachers.slice()));
      },
      error => this.error = error
    ).add(() => {
      this.editModuleProgress = false;
    });

  }

  getClass(classID: string | null) {
    this.dataService.getClassDetails(classID).subscribe(
      response => {
        console.log(response);
        this.data = response.classDetails[0];
        this.data.teachers = response.teachers;
        this.data.new = !this.data.moduleCode;
      }, error => this.error = error
    ).add(() => {
      this.teachers = this.data.teachers;
      this.moduleCode.setValue(this.data.moduleCode);
      this.moduleName.setValue(this.data.moduleName);
      this.description.setValue(this.data.description);
      this.year.setValue(this.data.year + '');
      this.day.setValue(this.data.day + '');
      this.time.setValue(this.data.time);
      this.duration.setValue(this.data.duration);
      this.teacher.markAsTouched();

    });
  }

  checkModule(moduleCode: string) {
    this.editModuleProgress = true;
    this.moduleExists = false;
    this.error = '';
    if (moduleCode !== '') {
      this.dataService.checkIfModuleExists(moduleCode).subscribe(
        response => {
          console.log(response);
          console.log(!response);
          if (this.data.new && response.status) {
            this.moduleName.setValue(response.moduleName);
            this.moduleExists = true;
          } else {
            this.moduleExists = false;
          }
        },
        error => this.error = error
      ).add(() => this.editModuleProgress = false);
    } else {
      this.editModuleProgress = false;
    }
  }

  addTeacher(): void {
    if (this.teacher.value) {
      const temp = this.allTeachers.find(teacher => teacher.username.toLowerCase() === this.teacher.value.toLowerCase());
      if (temp) {
        this.teachers.push(temp);
        this.teacher.setValue('');
      } else {
        this.teacher.setErrors({incorrect: true});
      }
    } else {
      this.teacher.setErrors({incorrect: true});
    }
  }

  removeTeacher(teacher: Teacher): void {
    const index = this.teachers.indexOf(teacher);
    if (index >= 0) {
      this.teachers.splice(index, 1);
    }
  }

  private _filter(value: string): Teacher[] {
    value = value.toLowerCase();
    return this.allTeachers.filter(teacher => teacher.username.toLowerCase().includes(value) ||
      (teacher.firstName + ' ' + teacher.lastName).toLowerCase().includes(value));
  }

  submitForm() {
    if (this.editClassForm.valid) {
      if (this.teachers.length !== 0) {
        const res = confirm('Are you sure you want to save changes?');
        if (res) {
          this.editModuleProgress = true;
          this.dataService.editClass({
            classID: this.data.classID,
            classDetails: this.editClassForm.value,
            teachers: this.teachers,
            new: this.data.new
          }).subscribe(
            (response) => {
              this.router.navigate(['../module-details', {classID: response.classID}], {relativeTo: this.route})
                .then(() => this.snackBar.open(
                  `Module successfully ${this.data.new ? 'created' : 'updated'}.`,
                  'Close',
                  {duration: 3000}));
            },
            error => this.savingError = error
          ).add(() => this.editModuleProgress = false);
        }

      } else {
        this.elementRef.nativeElement.querySelector('#selectTeacher').scrollIntoView({behavior: 'smooth'});
        this.teacher.setErrors({incorrect: true});
      }
    } else {
      this.editClassForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
    }
  }

  toggleProgress() {
    this.editModuleProgress = true;
  }

  scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.elementRef.nativeElement.querySelector('form .ng-invalid');
    firstInvalidControl.scrollIntoView({behavior: 'smooth'});
  }

  get moduleCode() {
    return this.editClassForm.get('moduleCode');
  }

  get moduleName() {
    return this.editClassForm.get('moduleName');
  }

  get description() {
    return this.editClassForm.get('description');
  }

  get teacher() {
    return this.editClassForm.get('teacher');
  }

  get day(): AbstractControl {
    return this.editClassForm.get('day');
  }

  get year(): AbstractControl {
    return this.editClassForm.get('year');
  }

  get time(): AbstractControl {
    return this.editClassForm.get('time');
  }

  get duration(): AbstractControl {
    return this.editClassForm.get('duration');
  }

  get daysOfWeek() {
    return DAYS_OF_WEEK;
  }

}
