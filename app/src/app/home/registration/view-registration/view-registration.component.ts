import {OnInit, Component, AfterViewInit, ViewChild, Inject} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {FormControl} from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DataService} from '../../../_services/data.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

interface Student {
  studentIndex: string;
  firstName: string;
  lastName: string;
  stream: string;
  year: string;
  approved: boolean;
}

@Component({
  selector: 'app-view-registration',
  templateUrl: './view-registration.component.html',
  styleUrls: ['./view-registration.component.css']
})
export class ViewRegistrationComponent implements OnInit, AfterViewInit {

  error = '';
  progress = false;

  allStudents: Student[];
  displayedColumns: string[] = ['position', 'studentIndex', 'studentName', 'stream', 'year', 'details'];
  dataSource: MatTableDataSource<Student> = new MatTableDataSource<Student>([]);
  selection = new SelectionModel<Student>(true, []);

  filter: FormControl = new FormControl('');

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('tabGroup') tabGroup;
  selectedIndex = 0;

  constructor(
    private snackBar: MatSnackBar,
    private data: DataService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {
    this.filter.valueChanges.subscribe(value => this.applyFilter(value));
    this.route.params.subscribe(params => this.selectedIndex = params.activeTab ? +params.activeTab : 0);
  }

  ngOnInit(): void {
    this.progress = true;
    this.data.getDetailedStudents().subscribe(
      response => {
        this.allStudents = response.students;
        this.filterData(this.selectedIndex);
        this.ngAfterViewInit();
      }, error => {
        this.error = error;
      }
    ).add(() => this.progress = false);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  filterData(value: number | MatTabChangeEvent): void {
    const index = value instanceof MatTabChangeEvent ? value.index : value;
    this.dataSource = new MatTableDataSource<Student>(this.allStudents.filter(
      student => index === 0 ? !student.approved : student.approved
    ));
    this.ngAfterViewInit();
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(studentID: string): void {
    const ref = this.dialog.open(StudentDetailsComponent, {
      width: '500px',
      data: studentID
    });
    ref.afterClosed().subscribe(response => {
      if (response) {
        this.snackBar.open('Student approved successfully..!', 'Close', {duration: 3000});
        this.selectedIndex = 1;
        this.ngOnInit();
      }
    });
  }

}

export interface StudentDetails {
  studentIndex: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  stream: string;
  year: number;
  district: string;
  school: string;
  approved: boolean;
}


@Component({
  selector: 'app-student-details-dialog',
  templateUrl: './student-details.component.html',
  styleUrls: ['./../registration.component.css']
})

export class StudentDetailsComponent implements OnInit {

  error = false;
  progress = false;

  studentDetails: StudentDetails;

  constructor(
    private dataService: DataService,
    public dialogRef: MatDialogRef<StudentDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {
  }

  ngOnInit() {
    this.error = false;
    this.progress = true;
    this.dataService.getStudentDetails(this.data).subscribe(
      response => this.studentDetails = response.student,
      error => this.error = error
    ).add(() => this.progress = false);
  }

  onApprove(): void {
    this.error = false;
    this.progress = true;
    console.log(this.data);
    this.dataService.approveStudent(this.data).subscribe(
      () => this.dialogRef.close(true),
      () => this.dialogRef.close(false)
    );
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}

