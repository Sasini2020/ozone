import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {EMPTY, Subject, Subscription} from 'rxjs';
import {debounceTime, switchMap} from 'rxjs/operators';
import {DataService} from '../../../_services/data.service';
import {Exam} from '../upload-result/upload-result.component';
import * as _ from 'lodash';
import {glow} from '../../../_services/shared.service';

@Component({
  selector: 'app-edit-result',
  templateUrl: './edit-result.component.html',
  styleUrls: ['./edit-result.component.css', '../results.component.css']
})
export class EditResultComponent implements OnInit, OnDestroy {

  academicYears: [];

  editResultsProgress = false;
  buttonProgress = false;
  moduleExists = false;
  success = false;
  resultsFound = false;
  successfullyDeleted = false;

  roteParameter: string;
  error: string;

  editResultsForm: FormGroup;
  examID: number;
  maxDate = new Date();
  exams: Exam[] = [];
  results = [];
  updatedResults = [];
  filteredResults = [];
  term$ = new Subject<string>();
  private searchSubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private data: DataService,
    private elementRef: ElementRef,
    private router: Router
  ) {

    this.searchSubscription = this.term$.pipe(
      debounceTime(1000),
      switchMap(moduleCode => {
        this.checkModule(moduleCode);
        return EMPTY;
      })
    ).subscribe();

  }

  ngOnInit(): void {
    this.editResultsProgress = true;
    this.data.getAcademicYears().subscribe(
      response => this.academicYears = response.academicYears,
      error => this.error = error
    ).add(() => this.editResultsProgress = false);

    this.editResultsForm = this.formBuilder.group({
      moduleCode: [this.roteParameter, [Validators.required, Validators.pattern(/^[A-Za-z]{2}[0-9]{4}/)]],
      moduleName: [''],
      academicYear: [{value: '', disabled: true}, [Validators.required]],
      dateHeld: [{value: '', disabled: true}, [Validators.required]]
    });

    this.route.params.subscribe(params => {
      if (params.moduleCode && /^[A-Za-z]{2}[0-9]{4}/.test(params.moduleCode)) {
        this.moduleCode.setValue(params.moduleCode);
        this.editResultsProgress = true;
        this.checkModule(params.moduleCode);
      }
    });

  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  checkModule(moduleCode: string) {
    this.academicYear.disable();
    this.dateHeld.disable();
    this.error = '';
    this.success = false;
    this.moduleExists = false;
    this.resultsFound = false;
    this.successfullyDeleted = false;
    if (moduleCode !== '') {
      this.data.checkIfModuleExists(moduleCode).subscribe(
        response => {
          this.moduleName.setValue(response.status ? '' : response.moduleName);
          this.moduleExists = response.status;
          if (this.moduleName) {
            this.academicYear.enable();
            this.academicYear.reset();
            this.elementRef.nativeElement.querySelector('#edit_academicYear').focus();
          }
        },
        error => this.error = error
      ).add(() => this.editResultsProgress = false);
    } else {
      this.editResultsProgress = false;
    }
  }

  checkIfResultsExists() {
    this.editResultsProgress = true;
    this.error = '';
    this.success = false;
    this.resultsFound = false;
    this.successfullyDeleted = false;
    this.data.checkIfResultsUploaded({
      moduleCode: this.moduleCode.value,
      academicYear: this.academicYear.value
    }).subscribe(
      response => {
        if (response.status) {
          const res = confirm('No previously uploaded results found for this module and academic year. Do you want to upload results?');
          if (res) {
            this.router.navigate(['../upload-results', {
              moduleCode: this.moduleCode.value,
              academicYear: this.academicYear.value
            }], {relativeTo: this.route});
          }
        } else {
          this.resultsFound = true;
        }
      }, error => this.error = error
    ).add(() => this.editResultsProgress = false);
  }

  getResults() {
    if (this.results.length === 0 || confirm('are you sure you want to discard changes?')) {
      this.error = '';
      this.success = false;
      this.data.getResultsOfModule({
        moduleCode: this.moduleCode.value,
        academicYear: this.academicYear.value
      }).subscribe(
        response => {
          console.log(response);
          this.examID = response.examID;
          this.dateHeld.setValue(response.dateHeld);
          this.results = response.results;
          this.updatedResults = _.cloneDeep(this.results);
          this.filteredResults = this.updatedResults;
          this.dateHeld.enable();
          this.dateHeld.setValue(response.dateHeld);
          this.elementRef.nativeElement.querySelector('#upload_preview').scrollIntoView({behavior: 'smooth'});
          glow(this.elementRef, 'upload_preview', 'rgb(100, 60, 180)');
        },
        error => this.error = error
      );
    }
  }

  modifyResults() {
    this.editResultsProgress = true;
    this.buttonProgress = true;
    if (confirm('Are you sure you want save changes?')) {
      this.error = '';
      this.success = false;
      if (this.editResultsForm.valid) {
        const selected = {
          examID: this.examID,
          dateHeld: this.dateHeld.value,
          results: this.updatedResults
        };
        this.data.editResults(selected).subscribe(
          response => {
            this.results = _.cloneDeep(this.updatedResults);
            try {
              this.elementRef.nativeElement.querySelectorAll('[id^="result_"]').forEach(element => element.style.background = 'white');
            } catch (exception) {
            }
            this.success = true;
            this.elementRef.nativeElement.querySelector('#success_message').scrollIntoView({behavior: 'smooth'});
            glow(this.elementRef, 'upload_preview', 'rgb(100, 60, 180)');
          },
          error => {
            this.error = error;
            this.elementRef.nativeElement.querySelector('#error_message').scrollIntoView({behavior: 'smooth'});
            glow(this.elementRef, 'upload_preview', 'red');
          }
        ).add(() => {
          this.editResultsProgress = false;
          this.buttonProgress = false;
        });
      } else {
        this.scrollToFirstInvalidControl();
        this.editResultsProgress = false;
        this.buttonProgress = true;
      }
    } else {
      this.editResultsProgress = false;
      this.buttonProgress = true;
    }
  }

  deleteExam() {
    if (confirm('Are your sure you want delete this exam?\nAll results will also be deleted.')) {
      this.editResultsProgress = true;
      this.data.deleteExam({
        moduleCode: this.moduleCode.value,
        academicYear: this.academicYear.value
      }).subscribe(
        response => {
          this.editResultsForm.reset();
          this.academicYear.disable();
          this.dateHeld.disable();
          this.results = [];
          this.successfullyDeleted = true;
        },
        error => console.log(error)
      ).add(() => setTimeout(() => this.editResultsProgress = false, 1000));
    }
  }

  onChange(i: number, value: string) {
    if (value === '') {
      this.elementRef.nativeElement.querySelector('#result_' + i).style.background = 'rgb(255,150,150)';
    } else {
      this.filteredResults[i].mark = parseInt(value, 10);
      this.elementRef.nativeElement
        .querySelector('#result_' + i).style.background = (this.filteredResults[i].mark !== this.results[i].mark) ? 'rgb(150,255,150)' : 'white';
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    if (filterValue) {
      this.filteredResults = this.updatedResults.filter(obj => obj.studentID.toLowerCase().includes(filterValue));
    } else {
      this.filteredResults = this.updatedResults;
    }
  }

  scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.elementRef.nativeElement.querySelector('form .ng-invalid');
    firstInvalidControl.scrollIntoView({behavior: 'smooth'});
  }

  toggleProgress() {
    this.editResultsProgress = true;
  }

  get moduleCode(): AbstractControl {
    return this.editResultsForm.get('moduleCode');
  }

  get moduleName(): AbstractControl {
    return this.editResultsForm.get('moduleName');
  }

  get academicYear(): AbstractControl {
    return this.editResultsForm.get('academicYear');
  }

  get dateHeld(): AbstractControl {
    return this.editResultsForm.get('dateHeld');
  }

}
