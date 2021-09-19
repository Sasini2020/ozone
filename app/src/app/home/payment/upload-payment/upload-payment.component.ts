import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataService} from '../../../_services/data.service';
import {EMPTY, Subject, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {AuthenticationService} from 'src/app/_services/authentication.service';
import {MatDialog} from '@angular/material/dialog';
import {HttpEventType} from '@angular/common/http';
import {UserDataService} from '../../../_services/user-data.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ImagePreviewDialogComponent} from '../../request/add-request/add-request.component';
import {glow} from '../../../_services/shared.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Class} from '../../course-module/new-module/new-module.component';

export interface Bank {
  bankID: number;
  bankName: string;
}

@Component({
  selector: 'app-upload-payment',
  templateUrl: './upload-payment.component.html',
  styleUrls: ['./upload-payment.component.css', '../../request/add-request/add-request.component.css']
})
export class UploadPaymentComponent implements OnInit, AfterViewInit {

  _classes: Class[] = [];

  uploadAPaymentProgress = false;
  studentIDNotFound = false;
  success = false;

  slipUploadProgress = 0;
  slipDownloadProgress = 0;
  slipDownloadError = '';

  fileName = '';
  imageChangedEvent: any = '';
  uploadedImageBase64: any = '';

  error = '';

  banks: Bank[] = [
    {bankID: 1, bankName: 'BOC'},
    {bankID: 2, bankName: 'Peoples Bank'}
  ];

  paymentForm: FormGroup;
  term$ = new Subject<string>();
  private searchSubscription: Subscription;

  paymentID: number;

  maxDate = new Date();

  slip: string;

  @ViewChild('fileUpload') fileUploadClick: ElementRef;
  @ViewChild('paymentFormRef') paymentFormRef;

  constructor(
    private formBuilder: FormBuilder,
    private data: DataService,
    private userData: UserDataService,
    private router: Router,
    private route: ActivatedRoute,
    private elementRef: ElementRef,
    private authentication: AuthenticationService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar
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

    this.route.params.subscribe(params => this.paymentID = params.paymentID);

  }

  ngOnInit(): void {
    this.paymentForm = this.formBuilder.group({
        depositor: this.formBuilder.group({
          registrationNumber: ['', [Validators.required, Validators.pattern(/^[A-Z][0-9]{6}$/)]],
          fullName: [''],
          classes: ['', [Validators.required]],
          year: [''],
        }),
        deposit: this.formBuilder.group({
          bankName: ['', [Validators.required]],
          slipNumber: ['', [Validators.required]],
          externalNote: [''],
          totalPaid: ['', [Validators.required]],
          paymentDate: ['', [Validators.required]],
        }),
      }
    );

    this.uploadAPaymentProgress = true;
    if (this.getRole === 'Student') {
      this.userData.getUserDetails().subscribe(
        response => {
          this.registrationNumber.setValue(response.studentDetails.studentIndex);
          this.fullName.setValue(response.studentDetails.studentName);
          this.year.setValue(response.studentDetails.year);
          this._classes = response.classes;
        }, error => this.error = error
      ).add(() => this.uploadAPaymentProgress = false);
    }
  }

  ngAfterViewInit(): void {
    this.uploadAPaymentProgress = true;
    if (this.paymentID) {
      this.data.getPaymentDetails(this.paymentID).subscribe(
        response => {
          if (response.status) {
            this.classes.setValue(response.paymentClasses.map(_class => _class.classID));
            this.bankName.setValue(response.paymentDetails.bank.trim());
            this.slipNumber.setValue(response.paymentDetails.slipNo);
            this.totalPaid.setValue(response.paymentDetails.amount);
            this.paymentDate.setValue(response.paymentDetails.paymentDate);
            this.externalNote.setValue(response.paymentDetails.externalNote);
            this.downloadSlip();
          }
        }, error => this.error = error
      ).add(() => this.uploadAPaymentProgress = false);
    } else {
      this.uploadAPaymentProgress = false;
    }
  }

  downloadSlip() {
    this.slipDownloadProgress = 0;
    this.slipDownloadError = '';
    this.error = '';
    this.slip = '';
    const data = {
      paymentID: this.paymentID,
      studentIndex: this.registrationNumber.value
    };
    this.data.getPaymentSlip(data).subscribe(
      response => {
        if (response.type === HttpEventType.DownloadProgress) {
          this.slipDownloadProgress = Math.round(100 * response.loaded / response.total);
        } else if (response.type === HttpEventType.Response) {
          if (response.body.status) {
            this.slip = 'data:image/png;base64,' + response.body.paymentSlip;
          }
        }
      },
      error => this.slipDownloadError = error
    ).add(() => this.slipDownloadProgress = 0);
  }

  onFileUpload(event: any): void {
    this.error = '';
    const uploadedImages = event.target.files;
    if (uploadedImages.length !== 0) {
      const image = uploadedImages[0];
      const mimeType = image.type;
      if (mimeType.match(/image\/*/) == null) {
        this.error = 'File type not supported';
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = () => {
          this.slip = reader.result as string;
        };
      }
    }
  }

  openImagePreview(): void {
    this.dialog.open(ImagePreviewDialogComponent, {
      maxWidth: '90%',
      maxHeight: '650px',
      data: this.slip
    });
  }

  removeImage(): void {
    this.slip = '';
  }

  submitForm() {
    this.uploadAPaymentProgress = true;
    this.error = '';
    this.success = false;
    if (this.paymentForm.valid) {
      if (this.slip) {
        const paymentDetails = this.paymentForm.value;
        paymentDetails.slip = this.slip;
        if (this.paymentID) {
          paymentDetails.paymentID = this.paymentID;
        }
        this.data.uploadPayment(paymentDetails).subscribe(
          response => {
            if (response.type === HttpEventType.DownloadProgress || response.type === HttpEventType.UploadProgress) {
              this.slipUploadProgress = Math.round(100 * response.loaded / response.total);
            } else if (response.type === HttpEventType.Response) {
              this.success = true;
              this.paymentForm.reset();
              this.slip = '';
              this.snackBar.open('Payment uploaded successfully', 'Close', {duration: 3000});
              this.router.navigate(
                [`${this.getRole === 'Student' ? '../payment-history' : '../view-payments-home/view-payments'}`],
                {relativeTo: this.route});
            }
          },
          error => {
            this.success = false;
            this.error = error;
          }
        ).add(() => {
          this.slipUploadProgress = 0;
          this.uploadAPaymentProgress = false;
        });
      } else {
        this.uploadAPaymentProgress = false;
        glow(this.elementRef, 'slip', 'rgb(255,0,0)');
        setTimeout(() => {
          this.elementRef.nativeElement.querySelector('#documents').scrollIntoView({behavior: 'smooth'});
        }, 2000);
      }
    } else {
      this.uploadAPaymentProgress = false;
      this.scrollToFirstInvalidControl();
    }

  }

  scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.elementRef.nativeElement.querySelector('form .ng-invalid');
    firstInvalidControl.scrollIntoView({behavior: 'smooth'});
  }

  checkStudentID(studentID) {
    this.success = false;
    this.error = '';
    this.studentIDNotFound = false;
    if (studentID) {
      this.data.checkStudentID(studentID).subscribe(
        response => {
          if (response.status) {
            this.fullName.setValue(response.studentDetails.studentName);
            this.year.setValue(response.studentDetails.year);
            this._classes = response.classes;
          } else {
            this.studentIDNotFound = true;
          }
        },
        error => this.error = error
      ).add(() => this.uploadAPaymentProgress = false);
    } else {
      this.uploadAPaymentProgress = false;
    }
  }

  get getRole() {
    return this.authentication.details.role;
  }

  clickFileUpload() {
    this.fileUploadClick.nativeElement.click();
  }


  toggleProgress() {
    this.uploadAPaymentProgress = true;
  }

  get fullName(): AbstractControl {
    return this.paymentForm.get('depositor').get('fullName');
  }

  get classes() {
    return this.paymentForm.get('depositor').get('classes');
  }

  get year() {
    return this.paymentForm.get('depositor').get('year');
  }

  get registrationNumber() {
    return this.paymentForm.get('depositor').get('registrationNumber');
  }

  get bankName() {
    return this.paymentForm.get('deposit').get('bankName');
  }

  get slipNumber() {
    return this.paymentForm.get('deposit').get('slipNumber');
  }

  get externalNote() {
    return this.paymentForm.get('deposit').get('externalNote');
  }

  get totalPaid() {
    return this.paymentForm.get('deposit').get('totalPaid');
  }

  get paymentDate() {
    return this.paymentForm.get('deposit').get('paymentDate');
  }

  resetForm() {
    this.bankName.setValue(null);
    this.slipNumber.setValue(null);
    this.externalNote.setValue(null);
    this.totalPaid.setValue(null);
    this.paymentDate.setValue(null);
    this.fileName = null;
    this.elementRef.nativeElement.querySelector('#course-name').scrollIntoView();
  }

}
