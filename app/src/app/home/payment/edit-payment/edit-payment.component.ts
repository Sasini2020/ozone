import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EMPTY, Subject, Subscription} from 'rxjs';
import {DataService} from '../../../_services/data.service';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {Bank} from '../upload-payment/upload-payment.component';
import {AuthenticationService} from 'src/app/_services/authentication.service';


@Component({
  selector: 'app-edit-payment',
  templateUrl: './edit-payment.component.html',
  styleUrls: ['./edit-payment.component.css']
})
export class EditPaymentComponent implements OnInit {

  dataSource = [];
  editPaymentProgress = false;
  hidePaymentDetails = false;
  success = false;
  panelOpenState = false;
  error = '';

  studentIDEntered: string;

  studentIDNotFound = false;

  banks: Bank[] = [
    {bankID: 1, bankName: 'BOC'},
    {bankID: 2, bankName: 'Peoples Bank'}
  ];

  editPaymentForm: FormGroup;
  term$ = new Subject<string>();
  private searchSubscription: Subscription;
  private elementRef: ElementRef;
  authentication: AuthenticationService;


  constructor(
    private formBuilder: FormBuilder,
    private data: DataService,
  ) {

    this.searchSubscription = this.term$.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap(studentID => {
        this.error = '';
        this.success = false;
        this.checkStudentID(studentID);
        return EMPTY;
      })
    ).subscribe();
  }

  ngOnInit(): void {
    this.editPaymentForm = this.formBuilder.group({
      studentID: ['', [Validators.required, Validators.pattern(/[0-9]{6}[A-Za-z]/)]],
      fullName: [''],
    });
  }

  checkStudentID(studentID: string) {
    this.error = '';
    this.success = false;
    this.studentIDNotFound = false;
    if (studentID) {
      this.data.checkStudentID(studentID).subscribe(
        response => {
          console.log(response);
          if (response.status) {
            this.studentIDEntered = studentID;
            this.fullName.setValue(response.name);
          } else {
            this.fullName.setValue('');
            this.studentIDNotFound = true;
          }
        },
        error => this.error = error
      ).add(() => this.editPaymentProgress = false);
    } else {
      this.fullName.setValue('');
      this.editPaymentProgress = false;
    }
  }

  getPaymentDetails(): void {
    this.error = '';
    this.success = false;
    this.editPaymentProgress = true;
    this.data.getStudentPaymentList(this.studentIDEntered).subscribe(
      response => {
        this.dataSource = response.results[0];
        this.dataSource.forEach(item => item.studentID = this.studentIDEntered);
      },
      error => this.error = error
    ).add(() => this.editPaymentProgress = false);
  }

  toggleProgress() {
    this.editPaymentProgress = true;
  }

  resetForm() {
    this.editPaymentForm.reset();
    this.editPaymentProgress = false;
    this.elementRef.nativeElement.querySelector('#course-name').scrollIntoView();
    this.ngOnInit();
  }

  deleteSelectedPayment(value: any) {
    this.hidePaymentDetails = value;
    this.ngOnInit();
  }

  get studentID(): AbstractControl {
    return this.editPaymentForm.get('studentID');
  }

  get fullName(): AbstractControl {
    return this.editPaymentForm.get('fullName');
  }

}
