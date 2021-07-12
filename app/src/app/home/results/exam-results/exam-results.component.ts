import {Component, ElementRef, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../../../_services/authentication.service';
import {DataService} from '../../../_services/data.service';
import {getSemester, glow, filter} from '../../../_services/shared.service';
import {FormControl} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-exam-results',
  templateUrl: './exam-results.component.html',
  styleUrls: ['./exam-results.component.css']
})
export class ExamResultsComponent implements OnInit {

  moduleCode: string;
  filter: FormControl = new FormControl('');

  resultsError = '';
  results = {};
  filteredResults = {};
  progress = false;
  resultsFound = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authentication: AuthenticationService,
    private data: DataService,
    private elementRef: ElementRef,
    private snackBar: MatSnackBar
  ) {
    if (this.getRole !== 'Student') {
      router.navigate(['../view-results'], {relativeTo: this.route});
    }
  }

  ngOnInit(): void {

    this.progress = true;
    this.route.params.subscribe(params => {
      this.moduleCode = params.moduleCode;
    });

    this.filter.valueChanges.subscribe(value => {
      Object.assign(this.filteredResults, filter(this.results, value, 'moduleCode', 'moduleName'));
      this.resultsFound = !this.isEmpty();
    });

    this.data.getExamResults().subscribe(
      response => {
        for (let i = 0; i < 4; i++) {
          this.results[getSemester(i)] = response.results.filter(result => result.semester === i + 1);
        }
        console.log(response);
        Object.assign(this.filteredResults, this.results);
        this.resultsFound = !this.isEmpty();
      },
      error => this.resultsError = error
    ).add(() => {
      this.progress = false;
      if (this.moduleCode) {
        setTimeout(() => {
          try {
            const element = this.elementRef.nativeElement.querySelector(`[id^='${this.moduleCode}']`);
            if (element) {
              element.scrollIntoView({behavior: 'smooth'});
              element.style.boxShadow = '0 0 0 2px purple';
              setTimeout(
                () => element.style.boxShadow = '0 0 0 2px white',
                2000
              );
            } else {
              this.snackBar.open(`No Exam Results Available for ${this.moduleCode}`, 'Close', {duration: 4000});
            }
          } catch (Exception) {
          }
        }, 500);
      }
    });
  }

  isEmpty(): boolean {
    for (let i = 0; i < 4; i++) {
      if (this.filteredResults[getSemester(i)].length !== 0) {
        return false;
      }
    }
    return true;
  }

  get getRole() {
    return this.authentication.details.role;
  }

  getColor(val: number) {
    const red = (val < 50) ? 250 : 500 - val * 5;
    const green = (val < 50) ? val * 5 : 250;
    return 'rgb(' + red + ',' + green + ',' + '0)';
  }

  getGradeColor(val: string, opacity: boolean) {
    let temp;
    switch (val) {
      case 'A+' :
        temp = 'rgba(0, 255, 0, 0.2)';
        break;
      case 'A' :
        temp = 'rgba(37, 255, 0, 0.2)';
        break;
      case 'A-' :
        temp = 'rgba(74, 255, 0, 0.2)';
        break;
      case 'B+' :
        temp = 'rgba(111, 255, 0, 0.2)';
        break;
      case 'B' :
        temp = 'rgba(147, 255, 0, 0.2)';
        break;
      case 'B-' :
        temp = 'rgba(183, 255, 0, 0.2)';
        break;
      case 'C+' :
        temp = 'rgba(220, 255, 0, 0.2)';
        break;
      case 'C' :
        temp = 'rgba(255, 255, 0, 0.2)';
        break;
      case 'C-' :
        temp = 'rgba(255, 220, 0, 0.2)';
        break;
      case 'D+' :
        temp = 'rgba(255, 183, 0, 0.2)';
        break;
      case 'D' :
        temp = 'rgba(255, 147, 0, 0.2)';
        break;
      case 'D-' :
        temp = 'rgba(255, 111, 0, 0.2)';
        break;
      case 'F+' :
        temp = 'rgba(255, 74, 0, 0.2)';
        break;
      case 'F' :
        temp = 'rgba(255, 37, 0, 0.2)';
        break;
      case 'F-' :
        temp = 'rgba(255, 0, 0, 0.2)';
        break;
    }
    if (opacity) {
      return temp.replace(/, 0.2/, '');
    }
    return temp;
  }

}
