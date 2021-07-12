import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {EMPTY, Observable, Subject, Subscription} from 'rxjs';
import {YEARS} from '../../../_services/shared.service';
import {MatAutocomplete} from '@angular/material/autocomplete';
import {DataService} from '../../../_services/data.service';
import {debounceTime, map, startWith, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {DAYS_OF_WEEK, ModuleData, Teacher} from '../course-module.component';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-new-module',
  templateUrl: './new-module.component.html',
  styleUrls: ['./new-module.component.css']
})
export class NewModuleComponent implements OnInit, AfterViewInit {

  selectable = true;
  removable = true;
  editModuleProgress = false;
  moduleExists = false;

  years = YEARS;
  savingError = '';
  error = '';

  LECTURE_TYPES: string[] = ['Lecture', 'Lab Session', 'Tutorial'];
  LECTURE_HALLS: string[] = ['New Auditorium', 'Phase 1 Auditorium', 'L1H01', 'L2H02', 'Lab 1', 'Lab 2', 'Lab 3'];
  routeParameter: string;
  teacherCtrl = new FormControl();
  filteredTeachers: Observable<Teacher[]>;
  teachers: Teacher[] = [];
  allTeachers: Teacher[] = [];
  editModuleForm: FormGroup;
  data: ModuleData;
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

    this.editModuleProgress = true;
    this.data = {moduleCode: '', moduleName: '', description: '', credits: 0, teachers: [], lectureHours: [], new: true};
    this.editModuleForm = this.formBuilder.group({
      moduleCode: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}[0-9]{4}/)]],
      moduleName: ['', [Validators.required, Validators.minLength(6)]],
      description: ['', [Validators.required, Validators.minLength(6)]],
      credits: ['', [Validators.required, Validators.pattern(/^(([1-9])|([0-9]\.[1-9]))$/)]],
      teacher: [''],
      lectureHours: this.formBuilder.array([]),
      newLectureHours: this.formBuilder.array([])
    });

  }

  ngAfterViewInit() {
    this.route.params.subscribe(params => this.getModule(params.moduleCode));
  }

  getModule(moduleCode: string | null) {
    this.dataService.getModuleDetails(moduleCode).subscribe(
      response => {
        console.log(response);
        this.data = response.moduleDetails;
        this.data.teachers = response.teachers;
        this.data.lectureHours = response.lectureHours;
        this.data.new = !this.data.moduleCode;
      }, error => this.error = error
    ).add(() => {

      this.teachers = this.data.teachers;
      this.moduleCode.setValue(this.data.moduleCode);
      this.moduleName.setValue(this.data.moduleName);
      this.credits.setValue(this.data.credits);
      this.description.setValue(this.data.description);
      this.teacher.markAsTouched();

      for (const lectureHour of this.data.lectureHours) {
        this.lectureHours.push(this.newLectureHour(
          lectureHour.lectureHourID,
          lectureHour.moduleCode,
          lectureHour.type,
          lectureHour.day,
          lectureHour.lectureHall,
          lectureHour.startingTime,
          lectureHour.endingTime
        ));
      }

      this.dataService.getTeachers().subscribe(
        response => {
          this.allTeachers = response.teachers;
          this.filteredTeachers = this.editModuleForm.get('teacher').valueChanges.pipe(
            startWith(null),
            map((teacher: string | null) => teacher ? this._filter(teacher) : this.allTeachers.slice()));
        },
        error => this.error = error
      ).add(() => {
        this.editModuleProgress = false;
        this.editModuleProgress = false;
      });
    });
  }

  checkModule(moduleCode: string) {
    this.moduleExists = false;
    this.error = '';
    if (moduleCode !== '') {
      this.dataService.checkIfModuleExists(moduleCode).subscribe(
        response => {
          if (this.data.new && !response.status) {
            this.moduleExists = true;
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

  addNewLectureHour(): void {
    this.newLectureHours.push(this.newLectureHour(0, '', 'Lecture', 0, 'Lab 1', '08:15', '10:15'));
  }

  newLectureHour(lectureHourID: number, moduleCode: string, type: string, day: number, lectureHall: string, startingTime: string, endingTime: string): FormGroup {
    return this.formBuilder.group({
      lectureHourID: [lectureHourID],
      moduleCode: [moduleCode],
      type: [type, Validators.required],
      day: [day.toString(), Validators.required],
      lectureHall: [lectureHall, Validators.required],
      startingTime: [startingTime, Validators.required],
      endingTime: [endingTime, Validators.required]
    });
  }

  removeLectureHour(index): void {
    this.lectureHours.removeAt(index);
  }

  removeNewLectureHour(index): void {
    this.newLectureHours.removeAt(index);
  }

  private _filter(value: string): Teacher[] {
    value = value.toLowerCase();
    return this.allTeachers.filter(teacher => teacher.username.toLowerCase().includes(value) ||
      (teacher.firstName + ' ' + teacher.lastName).toLowerCase().includes(value));
  }

  submitForm() {
    if (this.editModuleForm.valid) {
      if (this.teachers.length !== 0) {
        if (this.lectureHours.length !== 0 || this.newLectureHours.length !== 0) {
          const res = confirm('Are you sure you want to save changes?');
          if (res) {
            this.editModuleProgress = true;
            this.dataService.editModule({
              moduleDetails: this.editModuleForm.value,
              teachers: this.teachers,
              new: this.data.new
            }).subscribe(
              () => {
                this.router.navigate(['../module-details', {moduleCode: this.moduleCode.value}], {relativeTo: this.route})
                  .then(() => this.snackBar.open(
                    `Module successfully ${this.data.new ? 'created' : 'updated'}.`,
                    'Close',
                    {duration: 3000}));
              },
              error => this.savingError = error
            ).add(() => this.editModuleProgress = false);
          }
        } else {
          this.elementRef.nativeElement.querySelector('#newLectureHours').scrollIntoView({behavior: 'smooth'});
        }
      } else {
        this.elementRef.nativeElement.querySelector('#selectTeacher').scrollIntoView({behavior: 'smooth'});
        this.teacher.setErrors({incorrect: true});
      }
    } else {
      this.editModuleForm.markAllAsTouched();
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
    return this.editModuleForm.get('moduleCode');
  }

  get moduleName() {
    return this.editModuleForm.get('moduleName');
  }

  get credits() {
    return this.editModuleForm.get('credits');
  }

  get description() {
    return this.editModuleForm.get('description');
  }

  get teacher() {
    return this.editModuleForm.get('teacher');
  }

  get lectureHours(): FormArray {
    return this.editModuleForm.get('lectureHours') as FormArray;
  }

  get newLectureHours(): FormArray {
    return this.editModuleForm.get('newLectureHours') as FormArray;
  }

  get disabled() {
    return this.editModuleForm.get('disabled');
  }

  get daysOfWeek() {
    return DAYS_OF_WEEK;
  }

}
