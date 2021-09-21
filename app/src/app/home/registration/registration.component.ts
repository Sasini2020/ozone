import {Component, Inject, OnInit} from '@angular/core';
import {AuthenticationService} from '../../_services/authentication.service';
import {DataService} from '../../_services/data.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  progress = false;

  constructor(
    private authentication: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    if (this.getRole !== 'Student') {
      router.navigate(['./new-registration'], {relativeTo: this.route});
    }
  }

  ngOnInit(): void {
  }

  get getRole() {
    return this.authentication.details.role;
  }

}

// -----------------------------------------------------------------------------------------------------------------------------------------
// view registration details Component
// -----------------------------------------------------------------------------------------------------------------------------------------

@Component({
  selector: 'app-profile-details-dialog',
  templateUrl: './profile-details-dialog.component.html',
  styleUrls: ['./registration.component.css']
})

export class ProfileDetailsDialogComponent implements OnInit {

  progress = false;
  error;

  constructor(
    public dataService: DataService,
    public dialogRef: MatDialogRef<ProfileDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
  }

  ngOnInit() {
  }

  onNoClick() {
    this.dialogRef.close(false);
  }

  deleteModule() {
  }

}

// -----------------------------------------------------------------------------------------------------------------------------------------
// confirm registration msg Component
// -----------------------------------------------------------------------------------------------------------------------------------------

@Component({
  selector: 'app-confirm-details-dialog',
  templateUrl: './confirm-details-dialog.component.html',
  styleUrls: ['./registration.component.css']
})

export class ConfirmDetailsDialogComponent implements OnInit {

  progress = false;
  error;

  constructor(
    public dataService: DataService,
    public dialogRef: MatDialogRef<ConfirmDetailsDialogComponent>,
  ) {
  }

  ngOnInit() {
  }

}
