import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../_services/authentication.service';
import {DataService} from '../../_services/data.service';
import {MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  progress = false;

  constructor(
    private authentication: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
  }

  get getRole() {
    return this.authentication.details.role;
  }

}


// -----------------------------------------------------------------------------------------------------------------------------------------
// confirm upload payment msg Component
// -----------------------------------------------------------------------------------------------------------------------------------------

@Component({
  selector: 'app-confirm-upload-dialog',
  templateUrl: './confirm-upload-dialog.component.html',
  styleUrls: ['./payment.component.css']
})

export class ConfirmUploadDialogComponent implements OnInit {

  progress = false;
  error;
  private router: any;

  constructor(
    public dataService: DataService,
    public dialogRef: MatDialogRef<ConfirmUploadDialogComponent>,
  ) {
  }

  ngOnInit() {
  }

}
