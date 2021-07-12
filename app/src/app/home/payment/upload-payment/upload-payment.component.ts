import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DataService} from '../../../_services/data.service';
import {EMPTY, Subject, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {AuthenticationService} from 'src/app/_services/authentication.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ConfirmUploadDialogComponent} from '../payment.component';
import {HttpClient, HttpEventType} from '@angular/common/http';
import {ImageCroppedEvent} from 'ngx-image-cropper';
import {UserDataService} from '../../../_services/user-data.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ImagePreviewDialogComponent} from '../../request/add-request/add-request.component';
import {glow} from '../../../_services/shared.service';
import {MatSnackBar} from '@angular/material/snack-bar';

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

  uploadAPaymentProgress = false;
  studentIDNotFound = false;
  success = false;

  slipUploadProgress = 0;
  slipDownloadProgress = 0;
  slipDownloadError = '';

  fileName = '';
  requiredFileType = 'image/png';
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
  new = true;

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
          registrationNumber: ['', [Validators.required, Validators.pattern(/^([0-9]{6}[A-Za-z])$/)]],
          fullName: [''],
          course: [''],
          academicYear: [''],
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
          this.fullName.setValue(response.details.fullName);
          this.course.setValue(response.details.courseName);
          this.registrationNumber.setValue(response.details.username);
          this.academicYear.setValue(response.details.academicYear);
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
            console.log(response.payment);
            this.bankName.setValue(response.payment.bank.trim());
            this.slipNumber.setValue(response.payment.slipNo);
            this.totalPaid.setValue(response.payment.amount);
            this.paymentDate.setValue(response.payment.paymentDate);
            this.externalNote.setValue(response.payment.externalNote);
            this.new = false;
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
      studentID: this.registrationNumber.value
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
        paymentDetails.paymentID = this.new ? 0 : this.paymentID;
        paymentDetails.slip = this.slip;
        paymentDetails.new = this.new;
        this.data.uploadPayment(paymentDetails).subscribe(
          response => {
            if (response.type === HttpEventType.DownloadProgress || response.type === HttpEventType.UploadProgress) {
              this.openDialog();
              this.slipUploadProgress = Math.round(100 * response.loaded / response.total);
            } else if (response.type === HttpEventType.Response) {
              this.success = true;
              if (this.getRole === 'Admin') {
                this.paymentID = null;
                this.resetForm();
                this.slip = '';
                this.success = true;
              } else {
                this.router.navigate(['../payment-history', {paymentID: response.body.paymentID}], {relativeTo: this.route}).then(
                  () => this.snackBar.open('Payment details uploaded successfully', 'Close', {duration: 3000})
                );
              }
            }
          },
          error => {
            this.success = false;
            this.error = error;
          }
        ).add(() => this.uploadAPaymentProgress = false);
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
            this.fullName.setValue(response.name);
            this.academicYear.setValue(response.academicYear);
            this.course.setValue(response.course);
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

  get fullName() {
    return this.paymentForm.get('depositor').get('fullName');
  }

  get course() {
    return this.paymentForm.get('depositor').get('course');
  }

  get academicYear() {
    return this.paymentForm.get('depositor').get('academicYear');
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

  openDialog() {
    const dialogRef = this.dialog.open(ConfirmUploadDialogComponent, {
      width: '450px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response) {
      }
    });
  }

  onFileSelected(event) {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.uploadedImageBase64 = event.base64;
  }

}
