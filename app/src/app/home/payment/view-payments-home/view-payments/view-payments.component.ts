import {Component, Input, OnInit} from '@angular/core';
import {DataService} from '../../../../_services/data.service';
import {MatTableDataSource} from '@angular/material/table';
import {AuthenticationService} from 'src/app/_services/authentication.service';

export interface PeriodicElement {
  no: number;
  slipNo: string;
  bank: string;
  date: string;
  paidAmount: number;
}

@Component({
  selector: 'app-view-payments',
  templateUrl: './view-payments.component.html',
  styleUrls: ['./view-payments.component.css']
})

export class ViewPaymentsComponent implements OnInit {
  @Input('confirmedStudentPaymentDetails') confirmedStudentPaymentDetails;
  displayedColumns: string[] = ['no', 'slipNo', 'bank', 'date', 'paidAmount'];
  dataSource = new MatTableDataSource([]);
  filterValue = '';
  viewPaymentProgress: boolean;
  success = false;
  error = '';
  total: number;
  Remaining: number;

  constructor(
    private data: DataService,
    private authentication: AuthenticationService
  ) {
  }

  getStudentData() {
    this.viewPaymentProgress = true;
    this.data.getStudentPaymentLists().subscribe(
      response => {
        if (response.status) {
          console.log(response);
          this.dataSource = new MatTableDataSource(response.results[0]);
        } else {
          this.viewPaymentProgress = true;
        }
      },
      error => this.error = error
    ).add(() => this.viewPaymentProgress = false);
    this.viewPaymentProgress = false;
  }

  getTot(studentId: string) {
    if (studentId) {
      this.data.getStudentPaymentTot(studentId).subscribe(
        response => {
          if (response.status) {
            this.total=response.results[0][0].TOTAL;
            this.Remaining=response.results[0][0].REMAIN;
          } else {
            this.viewPaymentProgress = true;
          }
        },
        error => this.error = error
      ).add(() => this.viewPaymentProgress = false);
    } else {
      this.viewPaymentProgress = false;
    }
  }


  getData(studentId: string) {
    if (studentId) {
      this.data.getStudentPaymentList(studentId).subscribe(
        response => {
          if (response.status) {
            this.dataSource = new MatTableDataSource(response.results[0]);
          } else {
            this.viewPaymentProgress = true;
          }
        },
        error => this.error = error
      ).add(() => this.viewPaymentProgress = false);
    } else {
      this.viewPaymentProgress = false;
    }
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
  }

  ngOnInit(): void {
    if (this.getRole === 'Admin' && this.confirmedStudentPaymentDetails) {
      this.getData(this.confirmedStudentPaymentDetails.studentID);
      this.getTot(this.confirmedStudentPaymentDetails.studentID);
    } else if (this.getRole === 'Student') {
      this.getStudentData();
    }
  }

  get getRole() {
    return this.authentication.details.role;
  }
}
