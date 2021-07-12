import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {EMPTY, Subject, Subscription} from 'rxjs';
import {DataService} from '../../../_services/data.service';
import * as XLSX from 'xlsx';
import {ActivatedRoute, Router} from '@angular/router';
import {glow} from '../../../_services/shared.service';

export interface Exam {
  examID: number;
  type: string;
  dateHeld: Date;
  allocation: number;
  hideMarks: boolean;
}

export interface Result {
  index: string;
  mark: number;
}

@Component({
  selector: 'app-upload-result',
  templateUrl: './upload-result.component.html',
  styleUrls: ['./upload-result.component.css', '../results.component.css']
})

export class UploadResultComponent implements OnInit {

  academicYears: [];
  exams: Exam[] = [];

  routeParams = '';
  error = '';
  allocationAvailable;
  resultsFile;
  file;

  uploadResultsForm: FormGroup;
  term$ = new Subject<string>();
  private searchSubscription: Subscription;
  maxDate: Date = new Date();

  uploadResultsProgress = false;
  moduleExists = false;
  fileError = false;
  success = false;

  @ViewChild('resultUploadFormRef') resultUploadFormRef;
  constructor(
    private formBuilder: FormBuilder,
    private data: DataService,
    private elementRef: ElementRef,
    private route: ActivatedRoute,
    private router: Router
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

  ngOnInit(): void {
    this.getAcademicYears();
    this.route.params.subscribe(params => {
      this.routeParams = params.moduleCode;
    });
    this.uploadResultsForm = this.formBuilder.group({
      moduleCode: [this.routeParams, [Validators.required, Validators.pattern(/^[A-za-z]{2}[0-9]{4}/)]],
      moduleName: [''],
      dateHeld: [{value: '', disabled: true}, [Validators.required]],
      academicYear: [{value: '', disabled: true}, [Validators.required]],
    });
    if (this.routeParams !== undefined) {
      this.checkModule(this.routeParams);
    }
  }

  getAcademicYears(): void {
    this.uploadResultsProgress = true;
    this.data.getAcademicYears().subscribe(
      response => {
        this.academicYears = response.academicYears;
      },
      error => this.error = error
    ).add(() => this.uploadResultsProgress = false);
  }

  checkModule(moduleCode: string) {
    this.dateHeld.disable();
    this.academicYear.disable();
    this.error = '';
    this.success = false;
    this.moduleExists = false;
    if (moduleCode !== '') {
      this.data.checkIfModuleExists(moduleCode).subscribe(
        response1 => {
          this.moduleName.setValue(response1.status ? '' : response1.moduleName);
          this.moduleExists = response1.status;
          if (this.moduleName) {
            this.academicYear.enable();
            this.academicYear.reset();
            this.elementRef.nativeElement.querySelector('#upload_dateHeld').focus();
          }
        },
        error => {
          this.moduleName.setValue('');
          this.error = error;
        }
      ).add(() => this.uploadResultsProgress = false);
    } else {
      this.uploadResultsProgress = false;
    }
  }

  checkIfResultsExists() {
    this.uploadResultsProgress = true;
    this.data.checkIfResultsUploaded({
      moduleCode: this.moduleCode.value,
      academicYear: parseInt(this.academicYear.value, 10)
    }).subscribe(
      response => {
        if (response.status) {
          this.dateHeld.reset();
          this.dateHeld.enable();
        } else {
          const res = confirm('Previously uploaded results are found for this module and academic year. Do you want to modify instead?');
          if (res) {
            this.router.navigate(['results/edit-results', {moduleCode: this.moduleCode.value, acadamicyear: this.academicYear.value}]);
          } else {
            this.uploadResultsForm.reset();
          }
        }
      }, error => console.log(error)
    ).add(() => this.uploadResultsProgress = false);
  }

  onFileChange(ev) {
    this.uploadResultsProgress = true;
    this.resultsFile = [];
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
      this.resultsFile = jsonData.Sheet1;
      let isValid = true;
      if (this.resultsFile[0].hasOwnProperty('index') && this.resultsFile[0].hasOwnProperty('mark')) {
        for (const attendance of this.resultsFile) {
          if (attendance.index.toString().match(/^[0-9]{6}[A-Za-z]$/) === null ||
            isNaN(attendance.mark) || attendance.mark < 0 || attendance.mark > 100) {
            isValid = false;
            break;
          }
        }
      } else {
        isValid = false;
      }
      console.log(isValid);
      if (isValid) {
        this.resultsFile.sort((a, b) => a.index > b.index ? 1 : -1);
        glow(this.elementRef, 'upload_preview', 'rgb(100, 60, 180)');
      } else {
        this.resultsFile = [];
        glow(this.elementRef, 'upload_preview', 'red');
      }
      this.fileError = !isValid;
    };
    reader.readAsBinaryString(this.file);
    this.uploadResultsProgress = false;
    this.elementRef.nativeElement.querySelector('#resultFileUpload').value = '';
  }

  uploadResults() {
    this.success = false;
    this.error = '';
    this.uploadResultsProgress = true;
    if (confirm('Are you sure you want to save this file')) {
      if (this.uploadResultsForm.valid) {
        if (this.resultsFile.length !== 0) {
          const data = {
            moduleCode: this.moduleCode.value,
            dateHeld: this.dateHeld.value ? this.dateHeld.value : null,
            academicYear: this.academicYear.value,
            results: this.resultsFile
          };
          this.data.uploadExamResults(data).subscribe(
            response => {
              this.success = true;
              glow(this.elementRef, 'upload_preview', 'rgb(100, 60, 180)');
            },
            error => this.error = error
          ).add(() => this.uploadResultsProgress = false);
        } else {
          this.uploadResultsProgress = false;
          glow(this.elementRef, 'upload_preview', 'red');
          this.elementRef.nativeElement.querySelector('#upload_messages').scrollIntoView({behavior: 'smooth'});
        }
      } else {
        this.scrollToFirstInvalidControl();
      }
    } else {
      this.uploadResultsProgress = false;
    }
  }

  resetForm() {
    this.resultsFile = null;
    this.moduleExists = false;
    this.resultUploadFormRef.reset();
    this.getAcademicYears();
    setTimeout(() => this.uploadResultsProgress = false, 1000);
  }

  scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.elementRef.nativeElement.querySelector('form .ng-invalid');
    firstInvalidControl.scrollIntoView({behavior: 'smooth'});
  }

  openFile() {
    this.elementRef.nativeElement.querySelector('#resultFileUpload').click();
  }

  toggleProgress() {
    this.uploadResultsProgress = true;
  }

  get moduleCode() {
    return this.uploadResultsForm.get('moduleCode');
  }

  get moduleName() {
    return this.uploadResultsForm.get('moduleName');
  }

  get dateHeld() {
    return this.uploadResultsForm.get('dateHeld');
  }

  get academicYear() {
    return this.uploadResultsForm.get('academicYear');
  }

}
