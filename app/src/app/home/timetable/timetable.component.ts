import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../_services/authentication.service';

@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css'],
})
export class TimetableComponent implements OnInit {

  constructor(
    private authentication: AuthenticationService
  ) {
  }

  ngOnInit(): void {
  }

  get getRole(): string {
    return this.authentication.details.role;
  }

}
