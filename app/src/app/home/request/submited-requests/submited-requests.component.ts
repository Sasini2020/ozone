import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
import {ActivatedRoute, Route, Router} from '@angular/router';
import {AuthenticationService} from '../../../_services/authentication.service';
import {DataService} from '../../../_services/data.service';
import {FormControl} from '@angular/forms';
import {Request} from '../update-status/update-status.component';
import {glow} from '../../../_services/shared.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-submited-requests',
  templateUrl: './submited-requests.component.html',
  styleUrls: ['./submited-requests.component.css']
})
export class SubmitedRequestsComponent implements OnInit, AfterViewInit {

  requestError = '';
  progress = false;
  deleteProgress = false;

  requests: Request[];
  filter: FormControl = new FormControl('');
  requestID: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authentication: AuthenticationService,
    private data: DataService,
    private elementRef: ElementRef,
    private snackBar: MatSnackBar
  ) {

    this.route.params.subscribe(params => {
      this.requestID = params.requestID;
    });

    if (this.getRole !== 'Student') {
      router.navigate(['../new-requests'], {relativeTo: this.route});
    }
  }

  ngOnInit(): void {
    this.progress = true;
    this.data.getRequests().subscribe(
      response => {
        this.requests = response.requests;
        if (this.requestID) {
          setTimeout(() => {
            glow(this.elementRef, 'request' + this.requestID, 'purple');
            this.elementRef.nativeElement.querySelector(`#request${this.requestID}`).scrollIntoView({behavior: 'smooth'});
          }, 500);
        }
      },
      error => {
        this.requestError = error;
      }
    ).add(() => this.progress = false);

  }

  ngAfterViewInit() {
  }

  confirmDelete(requestID: number, index: number): void {
    if (confirm('Are you sure, you want to delete this request?')) {
      this.deleteRequest(requestID, index);
    }
  }

  deleteRequest(requestID: number, index: number): void {
    this.deleteProgress = true;
    this.data.deleteRequests([requestID]).subscribe(
      response => {
        this.requests.splice(index, 1);
        this.snackBar.open('Request deleted successfully', 'Close', {duration: 3000});
      }, error => {
        const snackBarRef = this.snackBar.open('Error occurred while deleting', 'Retry', {duration: 3000});
        snackBarRef.onAction().subscribe(() => {
          this.deleteRequest(requestID, index);
        });
      }
    ).add(() => this.deleteProgress = false);
  }

  editRequest(requestID: number): void {
    this.router.navigate(['../add-request', {requestID}], {relativeTo: this.route});
  }

  get getRole(): string {
    return this.authentication.details.role;
  }

}
