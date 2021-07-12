import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {UserDataService} from '../../_services/user-data.service';
import {AuthenticationService} from '../../_services/authentication.service';

export interface User {
  username: string;
  roleName: string;
  firstName: string;
  lastName: string;
  fullName: string;
  courseName: string;
  dateOfBirth: Date;
  email: string;
  recoveryEmail: string;
  address: string;
  mobile: string;
  home: string;
  academicYear: number;
  currentGPA: number | string;
  company: string;
  designation: string;
  nic: string;
  educationQualification: {
    degree: string;
    institute: string;
    dateCompleted: Date;
    class: string
  }[];
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewInit {

  progress = false;
  userDetails: User;
  error = '';
  profilePicture = 'assets/images/default_profile_picture.png';

  @Input() studentID: string;

  constructor(
    public userData: UserDataService,
    private authentication: AuthenticationService
  ) {
  }

  ngOnInit(): void {

    this.progress = true;

    if (this.studentID) {
      this.userData.getStudentDetails(this.studentID).subscribe(
        response => {
          this.userDetails = response.details;
          this.userDetails.educationQualification = response.educationQualifications;
          this.profilePicture = response.profilePicture ? `data:image/jpeg;base64,${response.profilePicture}` : this.profilePicture;
        },
        error => this.error = error
      ).add(() => this.progress = false);
    } else {
      this.userData.getUserDetails().subscribe(
        response => {
          this.userDetails = response.details;
          this.userDetails.educationQualification = response.educationQualifications;
        },
        error => {
          this.error = error;
        }
      ).add(() => this.progress = false);
    }
  }

  ngAfterViewInit() {
    if (!this.studentID) {
      this.profilePicture = this.userData.profilePicture;
    }
  }

  get getRole(): string {
    return this.authentication.details.role;
  }

}
