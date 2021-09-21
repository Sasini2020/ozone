import {Component, ElementRef, KeyValueDiffers, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataService} from '../../../_services/data.service';
import {YEARS} from '../../../_services/shared.service';
import {ConfirmDetailsDialogComponent} from '../registration.component';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';


export interface Course {
  courseID: number;
  courseName: string;
}

export interface District {
  code: string;
  name: string;
}

export interface Title {
  code: string;
  name: string;
}

export interface Province {
  code: string;
  name: string;
}

export const COURSES: Course[] = [
  {courseID: 1, courseName: 'MSC/PG DIPLOMA IN INFORMATION TECHNOLOGY'},
  {courseID: 2, courseName: 'MSC/PG DIPLOMA IN MULTIMEDIA TECHNOLOGY'},
];

@Component({
  selector: 'app-new-registration',
  templateUrl: './new-registration.component.html',
  styleUrls: ['./new-registration.component.css']
})
export class NewRegistrationComponent implements OnInit {

  registrationForm: FormGroup;
  registerStudentProgress = false;
  maxDate: Date = new Date();
  courses: Course[] = COURSES;
  academicYears = [];
  defaultYear = new Date().getFullYear();
  success = false;
  error = '';

  districts: District[] = [
    {code: 'LK-52', name: 'Ampara'},
    {code: 'LK-71', name: 'Anuradhapura'},
    {code: 'LK-81', name: 'Badulla'},
    {code: 'LK-51', name: 'Batticaloa'},
    {code: 'LK-11', name: 'Colombo'},
    {code: 'LK-31', name: 'Galle'},
    {code: 'LK-12', name: 'Gampaha'},
    {code: 'LK-33', name: 'Hambantota'},
    {code: 'LK-41', name: 'Jaffna'},
    {code: 'LK-13', name: 'Kalutara'},
    {code: 'LK-21', name: 'Kandy'},
    {code: 'LK-92', name: 'Kegalle'},
    {code: 'LK-42', name: 'Kilinochchi'},
    {code: 'LK-61', name: 'Kurunegala'},
    {code: 'LK-43', name: 'Mannar'},
    {code: 'LK-22', name: 'Matale'},
    {code: 'LK-32', name: 'Matara'},
    {code: 'LK-82', name: 'Monaragala'},
    {code: 'LK-45', name: 'Mulativu'},
    {code: 'LK-23', name: 'Nuwara Eliya'},
    {code: 'LK-72', name: 'Polonnaruwa'},
    {code: 'LK-62', name: 'Puttalam'},
    {code: 'LK-91', name: 'Ratnapura'},
    {code: 'LK-53', name: 'Trincomalee'},
    {code: 'LK-44', name: 'Vavuniya'}
  ];

  titles: Title[] = [
    {code: 'LK-3', name: 'Mr.'},
    {code: 'LK-5', name: 'Mrs.'},
    {code: 'LK-7', name: 'Ms.'},
    {code: 'LK-4', name: 'Rev. (Reverend)'},
  ];

  provinces: Province[] = [
    {code: 'LK-2', name: 'Central Province'},
    {code: 'LK-5', name: 'Eastern Province'},
    {code: 'LK-7', name: 'North Central Province'},
    {code: 'LK-6', name: 'North Western Province'},
    {code: 'LK-4', name: 'Northern Province'},
    {code: 'LK-9', name: 'Sabaragamuwa Province'},
    {code: 'LK-3', name: 'Southern Province'},
    {code: 'LK-8', name: 'Uva Province'},
    {code: 'LK-1', name: 'Western Province'},
  ];

  constructor(
    private formBuilder: FormBuilder,
    private data: DataService,
    private elementRef: ElementRef,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {

    this.registrationForm = this.formBuilder.group({
      firstName: ['Sirimal', [Validators.required]],
      lastName: ['Gunapala', [Validators.required]],
      email: ['sirimal.gunapala@hotmail.com', [Validators.required, Validators.email]],
      mobile: ['0412229637', [Validators.required, Validators.pattern(/^(0[1-9][0-9]{8})|(\+94[1-9][0-9]{8})$/)]],
      education: ['Bsc. Eng', [Validators.required]],
      institute: ['Michigan State University', [Validators.required]]
    });
  }

  submitForm() {
    this.registerStudentProgress = true;
    this.error = '';
    if (this.registrationForm.valid) {
      this.data.registerTeacher(this.registrationForm.value).subscribe(
        response => {
          if (response.status) {
            this.openDialog();
          }
          this.resetForm();
        },
        error => {
          this.success = false;
          this.error = error;
        }
      ).add(() => this.registerStudentProgress = false);
    } else {
      this.registerStudentProgress = false;
      this.scrollToFirstInvalidControl();
    }

  }

  scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.elementRef.nativeElement.querySelector('form .ng-invalid');
    firstInvalidControl.scrollIntoView({behavior: 'smooth'});
  }

  resetForm() {
    this.registrationForm.reset();
    Object.keys(this.registrationForm.controls).forEach(key => {
      this.registrationForm.get(key).setErrors(null) ;
    });
    this.elementRef.nativeElement.querySelector('#course-name').scrollIntoView();
  }

  get firstName(): AbstractControl {
    return this.registrationForm.get('firstName');
  }

  get lastName(): AbstractControl {
    return this.registrationForm.get('lastName');
  }

  get email() {
    return this.registrationForm.get('email');
  }

  get mobile() {
    return this.registrationForm.get('mobile');
  }

  get education(): AbstractControl {
    return this.registrationForm.get('education');
  }

  get institute(): AbstractControl {
    return this.registrationForm.get('institute');
  }

  openDialog() {
    this.dialog.open(ConfirmDetailsDialogComponent, {
      width: '450px',
      disableClose: true,
    });
  }

}
