import {OnInit, Component, ViewChild, AfterViewInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DataService} from '../../../_services/data.service';
import {MatTableDataSource} from '@angular/material/table';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatDialogRef} from '@angular/material/dialog';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {MatTabChangeEvent} from '@angular/material/tabs';

export interface Payment {
  paymentID: number;
  studentIndex: string;
  studentName: string;
  paymentDate: Date;
  amount: number;
  status: boolean;
}

@Component({
  selector: 'app-view-payments-home',
  templateUrl: './view-payments-home.component.html',
  styleUrls: ['./view-payments-home.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class ViewPaymentsHomeComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}

// -----------------------------------------------------------------------------------------------------------------------------------------
// confirm Update payment msg Component
// -----------------------------------------------------------------------------------------------------------------------------------------

@Component({
  selector: 'app-confirm-update-dialog',
  templateUrl: './confirm-update-dialog.component.html',
  styleUrls: ['./view-payments-home.component.css']
})

export class ConfirmUpdateDialogComponent implements OnInit {

  progress = false;
  error;
  private router: any;

  constructor(
    public dataService: DataService,
    public dialogRef: MatDialogRef<ConfirmUpdateDialogComponent>,
  ) {
  }

  ngOnInit() {
  }
}

// -----------------------------------------------------------------------------------------------------------------------------------------
// confirm Delete payment msg Component
// -----------------------------------------------------------------------------------------------------------------------------------------

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./view-payments-home.component.css']
})

export class ConfirmDeleteDialogComponent implements OnInit {

  progress = false;
  error;
  private router: any;

  constructor(
    public dataService: DataService,
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
  ) {
  }

  ngOnInit() {
  }

}
