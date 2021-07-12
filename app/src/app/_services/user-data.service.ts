import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class UserDataService {

  profilePicture: string;
  openComposer: boolean;
  private profilePictureChange: Subject<string> = new Subject<string>();
  private composerToggle: Subject<boolean> = new Subject<boolean>();

  constructor(
    private http: HttpClient
  ) {
    this.composerToggle.next(true);
    this.composerToggle.subscribe(value => this.openComposer = value);
    this.profilePictureChange.subscribe(value => this.profilePicture = value);
  }

  changeProfilePicture(profilePicture: string) {
    this.profilePictureChange.next(profilePicture);
  }

  toggleComposer() {
    this.composerToggle.next(!this.openComposer);
  }

  getUserDetails(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}get-user-details`, {});
  }

  updateUserData(data: object): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}update-user-data`, data);
  }

  getStudentDetails(studentID: string): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-student-details`, {studentID});
  }

}
