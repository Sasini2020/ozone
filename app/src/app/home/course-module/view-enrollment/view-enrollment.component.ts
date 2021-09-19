import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormControl} from '@angular/forms';
import {DataService} from '../../../_services/data.service';
import {ActivatedRoute, Router} from '@angular/router';
import {animate, state, style, transition, trigger} from '@angular/animations';


export interface Enrollment {
  enrollmentID: number;
  studentID: string;
  name: string;
  academicYear: number;
  date: Date;
  modules: string[];
}

@Component({
  selector: 'app-view-enrollment',
  templateUrl: './view-enrollment.component.html',
  styleUrls: ['./view-enrollment.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ViewEnrollmentComponent implements OnInit, AfterViewInit {

  error = '';
  progress = false;
  deleteEnrollmentProgress = false;

  numRows = 0;

  modules;

  allEnrollments: Enrollment[];
  displayedColumns: string[] = ['studentID', 'name', 'year', 'class', 'details'];
  dataSource: MatTableDataSource<Enrollment> = new MatTableDataSource<Enrollment>([]);
  expandedEnrollment: Enrollment;
  selection = new SelectionModel<Enrollment>(true, []);

  filter: FormControl = new FormControl('');

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private snackBar: MatSnackBar,
    private data: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.filter.valueChanges.subscribe(value => this.applyFilter(value));

  }

  ngOnInit(): void {
    this.getEnrollments();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getEnrollments(): void {
    this.progress = true;
    this.error = '';
    this.data.getEnrollments().subscribe(
      response => {
        this.numRows = response.numRows;
        this.allEnrollments = response.enrollments;
        this.dataSource = new MatTableDataSource<Enrollment>(this.allEnrollments);
        this.dataSource.sort = this.sort;
      },
      error => console.log(error)
    ).add(() => this.progress = false);
  }

  getModuleName(moduleCode: string): string | null {
    try {
      return this.modules.find(item => item.moduleCode === moduleCode).moduleName;
    } catch (error) {
      return null;
    }
  }

  viewDetails(enrollment: Enrollment) {
    this.router.navigate(
      ['../enroll', {studentID: enrollment.studentID}],
      {relativeTo: this.route}
    );
  }

  deleteItems(): void {
    this.deleteEnrollmentProgress = true;
    this.data.deleteEnrollments(this.selection.selected.map(enrollment => enrollment.enrollmentID)).subscribe(
      response => {
        this.selection.selected.forEach(item => {
          this.allEnrollments.splice(this.allEnrollments.indexOf(item), 1);
        });
        this.dataSource = new MatTableDataSource<Enrollment>(this.allEnrollments);
        this.selection.clear();
        this.snackBar.open('Items deleted successfully', 'Close', {duration: 3000});
      }, error => {
        const snackBarRef = this.snackBar.open('Error deleting selected items', 'Retry', {duration: 3000});
        snackBarRef.afterDismissed().subscribe(event => {
          if (event.dismissedByAction) {
            this.deleteItems();
          }
        });
      }
    ).add(() => this.deleteEnrollmentProgress = false);
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
