import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../../../_services/authentication.service';
import {DataService} from '../../../_services/data.service';
import {glow} from '../../../_services/shared.service';

export interface Payment {
  id: number;
  slipNo: number;
  amount: number;
  paymentDate: Date;
  bank: 'BOC' | 'Peoples Bank';
  studentID: string;
  confirmStatus: 0 | 1 | 2;
  description: string | null;
  externalNote: string | null;
}

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css']
})
export class PaymentHistoryComponent implements OnInit {

  payments: Payment[];
  paymentID: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authentication: AuthenticationService,
    private data: DataService,
    private elementRef: ElementRef
  ) {
    if (this.getRole === 'Admin') {
      this.router.navigate(['../view-payments-home'], {relativeTo: this.route});
    }

    this.route.params.subscribe(params => {
      this.paymentID = params.paymentID;
    });
  }

  ngOnInit(): void {
    this.data.getPayments().subscribe(
      response => {
        this.payments = response.payments.map(payment => {
          return {
            id: payment.id,
            slipNo: payment.slipNo,
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            bank: payment.bank.trim(),
            studentID: payment.studentID,
            confirmStatus: payment.confirmStatus,
            description: payment.description ? payment.description.trim() : null,
            externalNote: payment.externalNote ? payment.externalNote.trim() : null,
          };
        });
      }, error => console.log(error));
  }

  editPayment(paymentID: number): void {
    this.router.navigate(['../upload-payment', {paymentID}], {relativeTo: this.route});
  }

  get getRole(): string {
    return this.authentication.details.role;
  }

}
