import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../_services/authentication.service';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css']
})
export class RequestComponent implements OnInit {

  progress = false;

  constructor(
    private authentication: AuthenticationService
  ) {
  }

  ngOnInit(): void {
  }

  get role() {
    return this.authentication.details.role;
  }

}
