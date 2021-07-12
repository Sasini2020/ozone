import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../_services/authentication.service';


export interface Attendance {
  moduleName: string;
  moduleCode: string;
  attendance: [{
    batch: number;
    type: string;
    percentage: number;
  }];
}

export interface DetailedAttendance {
  moduleCode: string;
  moduleName: string;
  type: string;
  batch: number;
  attendance?: {}[];
}

export interface Session {
  sessionID: number;
  date: Date;
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {

  constructor(
    private authentication: AuthenticationService
  ) {
  }

  ngOnInit() {
  }

  get getRole() {
    return this.authentication.details.role;
  }

}
