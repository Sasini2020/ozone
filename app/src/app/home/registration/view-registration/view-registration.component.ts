import {OnInit, Component, ViewChild, AfterViewInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataService} from '../../../_services/data.service';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatDialog} from '@angular/material/dialog';
import { ProfileDetailsDialogComponent } from '../registration.component';

export interface Course {
  courseID: number;
  courseName: string;
}

export const COURSES: Course[] = [
  {courseID: 1, courseName: 'MSC/PG DIPLOMA IN INFORMATION TECHNOLOGY'},
  {courseID: 2, courseName: 'MSC/PG DIPLOMA IN MULTIMEDIA TECHNOLOGY'},
];

export interface PeriodicElement {
  position: number;
  studentID: string;
  title: string;
  fullName: string;
  nic: string;
  email: string;
  mobile: number;
}

@Component({
  selector: 'app-view-registration',
  templateUrl: './view-registration.component.html',
  styleUrls: ['./view-registration.component.css']
})
export class ViewRegistrationComponent implements OnInit, AfterViewInit {
  displayedColumns = ['studentID', 'title', 'name', 'nic', 'email', 'mobile', 'customDataColumn'];
  dataSource = new MatTableDataSource([]);
  filterValue = '';
  viewRegistrationsForm: FormGroup;
  viewRegistrationProgress = false;
  courses: Course[] = COURSES;
  academicYears = [];
  success = false;
  studentIDNotFound = false;
  public show = false;
  public buttonName: any = 'Show';
  defaultYear = new Date().getFullYear();


  error = '';
  registration: any;
  registrations: any;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;


  constructor(
    private formBuilder: FormBuilder,
    private data: DataService,
    public dialog: MatDialog
  ) { }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = this.filterValue.trim().toLowerCase();
  }

  ngOnInit(): void {
    this.viewRegistrationProgress = true;
    this.data.getAcademicYears().subscribe(
      response => this.academicYears = response.academicYears,
      error => this.error = error
    ).add(() => this.viewRegistrationProgress = false);

    this.viewRegistrationsForm = this.formBuilder.group({
      courseName: [1, [Validators.required]],
      academicYear: [1, [Validators.required]]
    });
  }

  toggle() {
    this.show = !this.show;

    if (this.show) {
      this.buttonName = 'Hide';
      this.getData();
    }
    else {
      this.buttonName = 'Show';
    }
  }

  ngAfterViewInit() {
    
  }

  getData(){
    this.viewRegistrationProgress = true;
    this.data.getRegisteredUsers({
      courseID: this.courseName.value,
      academicYear: this.academicYear.value
    }).subscribe(response => {
        this.dataSource = new MatTableDataSource(response.results[0]);
        this.filterValue = '';
        this.dataSource.filter = '';
        this.viewRegistrationProgress = false;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error => console.log(error)
    ).add(() => setTimeout(() => this.viewRegistrationProgress = false, 1000));
  }

  onChange(){
    console.log('onchange');
    this.show = false;
    this.buttonName = 'show';
  }

  get email(): AbstractControl  {
    return this.viewRegistrationsForm.get('email');
  }

  get mobile(): AbstractControl  {
    return this.viewRegistrationsForm.get('mobile');
  }

  get nic(): AbstractControl  {
    return this.viewRegistrationsForm.get('nic');
  }


  get title(): AbstractControl  {
    return this.viewRegistrationsForm.get('title');
  }

  get position(): AbstractControl  {
    return this.viewRegistrationsForm.get('position');
  }

  get courseName(): AbstractControl  {
    return this.viewRegistrationsForm.get('courseName');
  }

  get studentID(): AbstractControl  {
    return this.viewRegistrationsForm.get('studentID');
  }

  get fullName(): AbstractControl  {
    return this.viewRegistrationsForm.get('fullName');
  }

  get academicYear(): AbstractControl {
    return this.viewRegistrationsForm.get('academicYear');
  }


  openProfileDetailsDialog(studentID: string, fullName: string){
    this.dialog.open(ProfileDetailsDialogComponent, {
      width: '75%',
      height: '90%',
      panelClass: 'profileDialog',
      data: {
        studentID,
        fullName
      }
    });
  }

}
