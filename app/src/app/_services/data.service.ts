import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent} from '@angular/common/http';

import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  classURL = 'http://localhost:3000/api/class/';
  examURL = 'http://localhost:3000/api/exam/';
  attendanceURL = 'http://localhost:3000/api/attendance/';
  userURL = 'http://localhost:3000/api/user/';
  paymentURL = 'http://localhost:3000/api/payment/';
  requestURL = 'http://localhost:3000/api/request/';
  notificationURL = 'http://localhost:3000/api/notification/';

  constructor(
    private http: HttpClient
  ) {
  }

  getClasses() {
    return this.http.post<any>(`${this.classURL}get-classes`, {});
  }

  getClassDetails(classID: string) {
    return this.http.post<any>(`${this.classURL}get-class-details`, {classID});
  }

  getAcademicYears(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}get-academic-years`, {});
  }

  getAttendance(sessionID: number) {
    return this.http.post<any>(`${this.attendanceURL}get-attendance`, {sessionID});
  }

  getDetailedAttendance(classID: number) {
    return this.http.post<any>(`${this.attendanceURL}get-detailed-attendance`, {classID});
  }

  getSessions(classID: string) {
    return this.http.post<any>(`${this.attendanceURL}get-sessions`, {classID});
  }

  getTeachers() {
    return this.http.post<any>(`${this.classURL}get-teachers`, {});
  }

  checkIfModuleExists(value) {
    return this.http.post<any>(`${this.classURL}check-module`, {moduleCode: value});
  }

  editClass(data) {
    return this.http.post<any>(`${this.classURL}add-edit-class`, data);
  }

  deleteModule(data) {
    return this.http.post<any>(`${environment.adminUrl}delete-module`, data);
  }

  uploadAttendance(data) {
    return this.http.post<any>(`${this.attendanceURL}upload-attendance`, data);
  }

  modifyAttendance(attendance: object, sessionID: number) {
    return this.http.post<any>(`${this.attendanceURL}modify-attendance`, {sessionID, attendance});
  }

  getExams(classID: number) {
    return this.http.post<any>(`${this.examURL}get-exams`, {classID});
  }

  uploadExamResults(data) {
    return this.http.post<any>(`${this.examURL}upload-results`, data);
  }

  getStudentResults() {
    return this.http.post<any>(`${this.examURL}get-student-results`, {});
  }

  editResults(results) {
    return this.http.post<any>(`${this.examURL}modify-results`, results);
  }

  deleteExam(examID: string) {
    return this.http.post<any>(`${this.examURL}delete-exam`, {examID});
  }

  uploadProfilePicture(profilePicture) {
    return this.http.post<any>(`${this.userURL}upload-profile-picture`, {profilePicture}, {
      reportProgress: true,
      observe: 'events'
    });
  }

  getProfilePicture() {
    return this.http.post<any>(`${this.userURL}get-profile-picture`, {});
  }

  registerStudent(studentDetails) {
    return this.http.post<any>(`${environment.adminUrl}register-student`, {studentDetails});
  }

  checkStudentID(studentID) {
    return this.http.post<any>(`${this.userURL}get-student-details`, {studentID});
  }

  getStudents() {
    return this.http.post<any>(`${environment.teacherUrl}get-students`, {});
  }

  getModulesOfSemester(semester: number) {
    return this.http.post<any>(`${environment.adminUrl}get-modules-of-semester`, {semester});
  }

  uploadRequest(requestForm: object): Observable<any> {
    return this.http.post(`${this.requestURL}upload-request`, requestForm, {
      reportProgress: true,
      observe: 'events'
    });
  }

  getRequests(): Observable<any> {
    return this.http.post<any>(`${this.requestURL}get-requests`, {});
  }

  enrollStudent(enrollmentForm: object): Observable<any> {
    return this.http.post<any>(`${this.classURL}enroll-student`, enrollmentForm);
  }

  getResults(examID: string): Observable<any> {
    return this.http.post<any>(`${this.examURL}get-results`, {examID});
  }

  getRequestTypes(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}get-request-types`, {});
  }

  getRequestsBrief(studentID: string): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-requests-brief`, {studentID});
  }

  getRequestDetails(requestID: number): Observable<any> {
    return this.http.post<any>(`${this.requestURL}get-request-details`, {requestID});
  }

  updateRequest(data: object): Observable<any> {
    return this.http.post<any>(`${this.requestURL}update-request`, data);
  }

  getStudentRequests(studentIndex: string): Observable<any> {
    return this.http.post<any>(`${this.requestURL}get-student-requests`, {studentIndex});
  }

  getSubmittedRequests(): Observable<any> {
    return this.http.post<any>(`${this.requestURL}get-submitted-requests`, {});
  }

  deletePayments(paymentIDs: number[]): Observable<any> {
    return this.http.post<any>(`${this.paymentURL}delete-payments`, {paymentIDs});
  }

  deleteRequests(requestIDs: number[]): Observable<any> {
    return this.http.post<any>(`${this.requestURL}delete-requests`, {requestIDs});
  }

  getRequestDocuments(requestID: number): Observable<any> {
    return this.http.post<any>(`${this.requestURL}get-request-documents`, {requestID}, {
      reportProgress: true,
      observe: 'events'
    });
  }

  getAcademicCalenders(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}get-academic-calenders`, {});
  }

  updateAcademicCalender(data: object): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}update-academic-calender`, data);
  }

  getStudentAttendance(): Observable<any> {
    return this.http.post<any>(`${this.attendanceURL}get-student-attendance`, {});
  }

  getDetailedStudentAttendance(data: object): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-detailed-student-attendance`, data);
  }

  getDetailedModuleAttendance(data: object): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-detailed-module-attendance`, data);
  }

  deleteNotification(notificationID: number): Observable<any> {
    return this.http.post<any>(`${this.notificationURL}delete-notification`, {notificationID});
  }

  uploadPayment(paymentForm: object): Observable<any> {
    return this.http.post<any>(`${this.paymentURL}upload-payment`, paymentForm, {
      reportProgress: true,
      observe: 'events'
    });
  }

  getPayments(): Observable<any> {
    return this.http.post<any>(`${this.paymentURL}get-payments`, {});
  }

  getPaymentSlip(data: {}): Observable<any> {
    return this.http.post<any>(`${this.paymentURL}get-payment-slip`, data, {
      reportProgress: true,
      observe: 'events'
    });
  }

  getPaymentDetails(paymentID: number): Observable<any> {
    return this.http.post<any>(`${this.paymentURL}get-payment-details`, {paymentID});
  }

  getStudentPaymentTot(studentID: any) {
    return this.http.post<any>(`${environment.adminUrl}get-student-payment-tot`, {studentID});
  }

  getStudentPayments(): Observable<any> {
    return this.http.post<any>(`${this.paymentURL}get-student-payments`, {});
  }

  deletePayment(data): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}delete-payment`, data);
  }

  editPayment(data): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}edit-payment`, data);
  }

  getRegisteredUsers(data: object) {
    return this.http.post<any>(`${environment.adminUrl}get-registered-users`, data);
  }

  getEnrollments(): Observable<any> {
    return this.http.post<any>(`${this.classURL}get-enrollments`, {});
  }

  deleteEnrollments(enrollmentIDs: number[]): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}delete-enrollments`, {enrollmentIDs});
  }

  getNotifications(): Observable<any> {
    return this.http.post<any>(`${this.notificationURL}get-notifications`, {});
  }

  updateNotificationStatus(received: string[]): Observable<any> {
    return this.http.post<any>(`${this.notificationURL}update-notification-status`, {received});
  }

}
