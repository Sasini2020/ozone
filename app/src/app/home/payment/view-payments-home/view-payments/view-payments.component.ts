import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {DataService} from '../../../../_services/data.service';
import {MatTableDataSource} from '@angular/material/table';
import {AuthenticationService} from 'src/app/_services/authentication.service';
import {SelectionModel} from '@angular/cdk/collections';
import {FormControl} from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {Payment} from '../view-payments-home.component';

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

export class ViewPaymentsComponent implements OnInit, AfterViewInit {


  error = '';
  progress = false;

  allPayments: Payment[];
  displayedColumns: string[] = ['select', 'position', 'studentIndex', 'studentName', 'paymentDate', 'amount', 'details'];
  dataSource: MatTableDataSource<Payment> = new MatTableDataSource<Payment>([]);
  selection = new SelectionModel<Payment>(true, []);

  filter: FormControl = new FormControl('');

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('tabGroup') tabGroup;
  selectedIndex = 0;


  constructor(
    private snackBar: MatSnackBar,
    private data: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filter.valueChanges.subscribe(value => this.applyFilter(value));
    this.route.params.subscribe(params => this.selectedIndex = params.activeTab ? +params.activeTab : 0);
  }


  ngOnInit(): void {
    this.progress = true;
    this.data.getPayments().subscribe(
      response => {
        this.allPayments = response.payments;
        console.log(this.allPayments);
        this.filterData(this.selectedIndex);
        this.ngAfterViewInit();
      }, error => {
        this.error = error;
      }
    ).add(() => this.progress = false);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  viewDetails(payment: Payment): void {
    this.router.navigate(['../view-payment-details', {
      paymentID: payment.paymentID
    }], {relativeTo: this.route});
  }

  filterData(value: number | MatTabChangeEvent): void {
    const index = value instanceof MatTabChangeEvent ? value.index === 1 : value === 1;
    this.dataSource = new MatTableDataSource<Payment>(this.allPayments.filter(payment => payment.status === index));
    this.ngAfterViewInit();
  }

  deletePayments(): void {
    if (confirm('Are you sure, you want to delete selected items?')) {
      this.data.deletePayments(this.selection.selected.map(payment => payment.paymentID)).subscribe(
        response => {
          this.selection.selected.forEach(item => {
            this.allPayments.splice(this.allPayments.indexOf(item), 1);
            this.filterData(this.tabGroup.selectedIndex);
            this.selection.clear();
          });
          this.snackBar.open('Items deleted successfully', 'Close', {duration: 3000});
        }, error => this.snackBar.open('Error deleting selected items', 'Close', {duration: 3000})
      );
    }
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: Payment): string {
    console.log(this.selection.selected);
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.paymentID + 1}`;
  }

}
