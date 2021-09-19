import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../../../_services/authentication.service';
import {DataService} from '../../../_services/data.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormControl} from '@angular/forms';

export interface Payment {
  paymentID: number;
  slipNo: number;
  amount: number;
  paymentDate: Date;
  bank: 'BOC' | 'Peoples Bank';
  studentID: string;
  status: boolean;
  externalNote: string | null;
  classes: {
    _class: string;
  }[];
}

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css']
})
export class PaymentHistoryComponent implements OnInit {

  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  paymentID: number;

  filter: FormControl = new FormControl('');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authentication: AuthenticationService,
    private data: DataService,
    private snackBar: MatSnackBar
  ) {
    if (this.getRole === 'Admin') {
      this.router.navigate(['../view-payments-home'], {relativeTo: this.route});
    }

    this.route.params.subscribe(params => {
      this.paymentID = params.paymentID;
    });
  }

  ngOnInit(): void {

    this.filter.valueChanges.subscribe(value => this._filter(value));

    this.data.getStudentPayments().subscribe(
      response => {
        this.payments = response.payments;
        this.filteredPayments = this.payments;
      }, error => console.log(error));

  }

  editPayment(paymentID: number): void {
    this.router.navigate(['../upload-payment', {paymentID}], {relativeTo: this.route});
  }

  deletePayment(paymentID: number) {
    if (confirm('Are you sure, you want to delete this payment?')) {
      this.data.deletePayments([paymentID]).subscribe(
        response => {
          this.snackBar.open('Payment deleted successfully', 'Close', {duration: 3000});
          this.ngOnInit();
        },
        error => this.snackBar.open('Error deleting payment', 'Close', {duration: 3000})
      );
    }
  }

  get getRole(): string {
    return this.authentication.details.role;
  }

  _filter(value: string): void {
    const filterValue = value ? value.trim().toLowerCase() : '';
    if (filterValue) {
      this.filteredPayments = this.payments.filter(
        payment => payment.slipNo.toString().includes(filterValue) || payment.paymentDate.toString().toLowerCase().includes(filterValue)
      );
    } else {
      this.filteredPayments = this.payments;
    }
  }

}
