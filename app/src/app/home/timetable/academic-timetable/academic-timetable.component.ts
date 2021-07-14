import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../../../_services/data.service';
import {EventSettingsModel, MonthService, WeekService, WorkWeekService} from '@syncfusion/ej2-angular-schedule';
import {DataManager, WebApiAdaptor} from '@syncfusion/ej2-data';
import {AuthenticationService} from '../../../_services/authentication.service';

@Component({
  /*selector: 'app-academic-timetable',*/
  providers: [WeekService, MonthService, WorkWeekService],
  templateUrl: './academic-timetable.component.html',
  styleUrls: ['../timetable.component.css', './academic-timetable.component.css']
})
export class AcademicTimetableComponent implements OnInit {

  defaultData = [];

 

  constructor(
   public router: Router,
    public data: DataService,
    private authentication: AuthenticationService
  ) {
  }

  ngOnInit(): void {
    console.log(this.authentication.details.username);
  }

}
