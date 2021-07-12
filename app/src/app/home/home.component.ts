import {Component, HostListener, OnInit, Sanitizer} from '@angular/core';
import {AuthenticationService} from '../_services/authentication.service';
import {MatDialog} from '@angular/material/dialog';
import {ProfilePictureComponent} from './profile/profile-picture/profile-picture.component';
import {DataService} from '../_services/data.service';
import {UserDataService} from '../_services/user-data.service';
import {NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  newNotifications = 0;
  widthSidenav: boolean;
  widthNotification: boolean;
  activeRoute: string;
  childRoute: string;
  hidden = false;
  user;
  ROUTS = {
    Admin: [{
      component: 'CourseModuleComponent',
      route: 'course-modules',
      icon: 'grade',
      label: 'Course Modules',
      children: [{
        component: 'NewModuleComponent',
        route: 'new-module',
        label: 'Add New Module'
      }, {
        component: 'EnrollComponent',
        route: 'enroll',
        label: 'Enroll Students'
      }, {
        component: 'ViewEnrollmentComponent',
        route: 'view-enrollments',
        label: 'View Enrollments'
      }]
    }, {
      component: 'ResultsComponent',
      route: 'results',
      icon: 'assessment',
      label: 'Exam Results',
      children: [{
        component: 'ViewResultComponent',
        route: 'view-results',
        label: 'View Results'
      }, {
        component: 'UploadResultComponent',
        route: 'upload-results',
        label: 'Upload Results'
      }, {
        component: 'EditResultComponent',
        route: 'edit-results',
        label: 'Edit Results'
      }]
    }, {
      component: 'AttendanceComponent',
      route: 'attendance',
      icon: 'assignment_turned_in',
      label: 'Attendance',
      children: [{
        component: 'ViewAttendance',
        route: 'view-attendance',
        label: 'View Attendance'
      }, {
        component: 'UploadAttendance',
        route: 'upload-attendance',
        label: 'Upload Attendance'
      }, {
        component: 'EditAttendance',
        route: 'edit-attendance',
        label: 'Edit Attendance'
      }]
    }, {
      component: 'TimetableComponent',
      route: 'timetable',
      icon: 'watch_later',
      label: 'Timetable',
      children: [{
        component: 'AcademicTimetableComponent',
        route: 'academic-timetable',
        label: 'Academic Timetable'
      }, {
        component: 'AcademicCalenderComponent',
        route: 'academic-calender',
        label: 'Academic Calender'
      }]
    }, {
      component: 'PaymentComponent',
      route: 'payment',
      icon: 'monetization_on',
      label: 'Payment',
      children: [{
        component: 'ViewPaymentHomeComponent',
        route: 'view-payments-home',
        label: 'View Payment'
      }, {
        component: 'UploadPaymentComponent',
        route: 'upload-payment',
        label: 'Upload Payment'
      }, {
        component: 'EditPaymentComponent',
        route: 'edit-payment',
        label: 'Edit Payment'
      }]
    }, {
      component: 'RequestComponent',
      route: 'request',
      icon: 'description',
      label: 'Requests',
      children: [ {
        component: 'NewRequestsComponent',
        route: 'new-requests',
        label: 'New Requests'
      }, {
        component: 'AddRequestComponent',
        route: 'add-request',
        label: 'Add Request'
      }, {
        component: 'UpdateStatusComponent',
        route: 'update-status',
        label: 'Update Status'
      }]
    }, {
      component: 'RegistrationComponent',
      route: 'registration',
      icon: 'how_to_reg',
      label: 'Registration',
      children: [
        {
          component: 'NewRegistrationComponent',
          route: 'new-registration',
          label: 'New Registration'
        },
        {
          component: 'ViewRegistrationComponent',
          route: 'view-registration',
          label: 'View Registration'
        }
      ]
    }],
    Student: [{
      component: 'CourseModuleComponent',
      route: 'course-modules',
      icon: 'grade',
      label: 'Course Modules',
      children: []
    }, {
      component: 'ResultsComponent',
      route: 'results',
      icon: 'assessment',
      label: 'Exam Results',
      children: []
    }, {
      component: 'AttendanceComponent',
      route: 'attendance',
      icon: 'assignment_turned_in',
      label: 'Attendance',
      children: []
    }, {
      component: 'TimetableComponent',
      route: 'timetable',
      icon: 'watch_later',
      label: 'Timetable',
      children: [{
        component: 'AcademicTimetableComponent',
        route: 'academic-timetable',
        label: 'Academic Timetable'
      }, {
        component: 'AcademicCalenderComponent',
        route: 'academic-calender',
        label: 'Academic Calender'
      }]
    }, {
      component: 'PaymentComponent',
      route: 'payment',
      icon: 'monetization_on',
      label: 'Payments',
      children: [{
        component: 'UploadPaymentComponent',
        route: 'upload-payment',
        label: 'Upload Payment'
      }]
    }, {
      component: 'RequestComponent',
      route: 'request',
      icon: 'description',
      label: 'Requests',
      children: [{
        component: 'AddRequestComponent',
        route: 'add-request',
        label: 'Add Request'
      }]
    }],
    Teacher: [{
      component: 'CourseModuleComponent',
      route: 'course-modules',
      icon: 'grade',
      label: 'Course Modules',
      children: []
    }, {
      component: 'ResultsComponent',
      route: 'results',
      icon: 'assessment',
      label: 'Exam Results',
      children: [{
        component: 'ViewResultComponent',
        route: 'view-results',
        label: 'View Results'
      }]
    }, {
      component: 'AttendanceComponent',
      route: 'attendance',
      icon: 'assignment_turned_in',
      label: 'Attendance',
      children: [{
        component: 'ViewAttendance',
        route: 'view-attendance',
        label: 'View Attendance'
      }]
    }, {
      component: 'TimetableComponent',
      route: 'timetable',
      icon: 'watch_later',
      label: 'Timetable',
      children: [{
        component: 'AcademicTimetableComponent',
        route: 'academic-timetable',
        label: 'Academic Timetable'
      }, {
        component: 'AcademicCalenderComponent',
        route: 'academic-calender',
        label: 'Academic Calender'
      }]
    }]
  };

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    this.widthSidenav = event.target.innerWidth < 850;
    this.widthNotification = event.target.innerWidth < 1170;
  }

  constructor(
    private router: Router,
    private authentication: AuthenticationService,
    public dialog: MatDialog,
    private data: DataService,
    public userData: UserDataService
  ) {
    this.widthSidenav = (window.innerWidth) < 850;
    this.widthNotification = (window.innerWidth) < 1170;
  }

  ngOnInit(): void {

    this.childRoute = this.router.url.split(/\//)[2];

    this.user = this.authentication.details;
    this.data.getProfilePicture().subscribe(
      response => {
        this.userData.changeProfilePicture('data:image/jpeg;base64,' + response.profilePicture);
      },
      error => console.log(error)
    );

    this.router.events.subscribe(value => {
      if (value instanceof NavigationEnd) {
        this.childRoute = value.urlAfterRedirects.split(/\//)[2];
      }
    });

  }

  openDialog() {
    const dialogRef = this.dialog.open(ProfilePictureComponent, {
      panelClass: 'custom-dialog-container',
      width: '500px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    });
  }

  getRoute(event: any) {
    this.activeRoute = event.constructor.name;
  }

  get getRole() {
    return this.authentication.details.role;
  }

  logout() {
    this.authentication.logout();
  }

}
