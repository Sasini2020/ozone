import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../_services/authentication.service';

export interface Module {
  moduleCode: string;
  moduleName: string;
  batch: number;
  grade: string;
}

export interface Result {
  moduleCode: string;
  dateHeld: Date;
  semester: number;
  academicYear: number;
  grade: string;
}

export interface CalculatedResult {
  moduleCode: string;
  moduleName: string;
  batch: number;
  grade: string;
  marks: {
    type: string;
    dateHeld: Date;
    allocation: number;
    mark: number;
    grade: string;
  }[];
}

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {

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
