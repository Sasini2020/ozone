import {AfterViewInit, Component, ElementRef, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {DataService} from '../../../../_services/data.service';
import {HttpEventType} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {Class} from '../../../course-module/new-module/new-module.component';
import {EMPTY, Subject, Subscription} from 'rxjs';
import {UserDataService} from '../../../../_services/user-data.service';
import {AuthenticationService} from '../../../../_services/authentication.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {ImagePreviewDialogComponent} from '../../../request/add-request/add-request.component';
import {glow} from '../../../../_services/shared.service';

export interface Bank {
  bankID: number;
  bankName: string;
}


@Component({
  selector: 'app-view-payment-details',
  templateUrl: './view-payment-details.component.html',
  styleUrls: ['./view-payment-details.component.css']
})
export class ViewPaymentDetailsComponent implements OnInit {


  _classes: Class[] = [];

  uploadAPaymentProgress = false;
  studentIDNotFound = false;
  success = false;

  slipUploadProgress = 0;
  slipDownloadProgress = 0;
  slipDownloadError = '';

  fileName = '';
  uploadedImageBase64: any = '';

  error = '';

  banks: Bank[] = [
    {bankID: 1, bankName: 'BOC'},
    {bankID: 2, bankName: 'Peoples Bank'}
  ];

  paymentForm: FormGroup;

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

    this.route.params.subscribe(params => {
      this.paymentID = params.paymentID;
      if (!this.paymentID) {
        router.navigate(['../view-payments'], {relativeTo: this.route});
      }
    });

  }

  ngOnInit(): void {
    this.paymentForm = this.formBuilder.group({
        depositor: this.formBuilder.group({
          registrationNumber: [''],
          fullName: [''],
          classes: ['', [Validators.required]],
          year: [''],
        }),
        deposit: this.formBuilder.group({
          bankName: ['', [Validators.required]],
          slipNumber: ['', [Validators.required]],
          externalNote: ['t'],
          totalPaid: ['', [Validators.required]],
          paymentDate: ['', [Validators.required]],
          status: [false]
        })
      }
    );

    this.uploadAPaymentProgress = true;
    this.data.getPaymentDetails(this.paymentID).subscribe(
      response => {
        this._classes = response.enrolledClasses;
        this.registrationNumber.setValue(response.paymentDetails.studentIndex);
        this.fullName.setValue(response.paymentDetails.studentName);
        this.year.setValue(response.paymentDetails.year);
        this.paymentDate.setValue(response.paymentDetails.paymentDate);
        this.slipNumber.setValue(response.paymentDetails.slipNo);
        this.bankName.setValue(response.paymentDetails.bank);
        this.totalPaid.setValue(response.paymentDetails.amount);
        this.externalNote.setValue(response.paymentDetails.externalNote);
        this.status.setValue(response.paymentDetails.status);
        this.classes.setValue(response.paymentClasses.map(_class => _class.classID));
        this.downloadSlip();
      }, error => {
        this.error = error;
      }
    ).add(() => this.uploadAPaymentProgress = false);

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
        paymentDetails.paymentID = this.paymentID;
        paymentDetails.slip = this.slip;
        paymentDetails.new = true;
        this.data.uploadPayment(paymentDetails).subscribe(
          response => {
            if (response.type === HttpEventType.DownloadProgress || response.type === HttpEventType.UploadProgress) {
              this.slipUploadProgress = Math.round(100 * response.loaded / response.total);
            } else if (response.type === HttpEventType.Response) {
              this.success = true;
              this.paymentForm.reset();
              this.slip = '';
              this.snackBar.open('Payment updated successfully', 'Close', {duration: 3000});
              this.router.navigate(['../view-payments'], {relativeTo: this.route});
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

  get getRole() {
    return this.authentication.details.role;
  }

  clickFileUpload() {
    this.fileUploadClick.nativeElement.click();
  }


  toggleProgress() {
    this.uploadAPaymentProgress = true;
  }

  get fullName() {
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

  get status(): AbstractControl {
    return this.paymentForm.get('deposit').get('status');
  }

}
