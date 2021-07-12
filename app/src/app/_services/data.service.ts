import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent} from '@angular/common/http';

import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private http: HttpClient
  ) {
  }

  getModules() {
    return this.http.post<any>(`${environment.apiUrl}get-modules`, {});
  }

  getModuleDetails(moduleCode: string) {
    return this.http.post<any>(`${environment.adminUrl}get-module-details`, {moduleCode});
  }

  getAcademicYears(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}get-academic-years`, {});
  }

  getAssignments() {
    return this.http.post<any>(`${environment.teacherUrl}get-assignments`, {});
  }

  getAttendance() {
    return this.http.post<any>(`${environment.apiUrl}get-attendance`, {});
  }

  getDetailedAttendance(moduleCode: string, type: string, batch: number) {
    return this.http.post<any>(`${environment.apiUrl}get-detailed-attendance`, {moduleCode, type, batch});
  }

  getLectureHours() {
    return this.http.post<any>(`${environment.apiUrl}get-lecture-hours`, {});
  }

  getLectureHoursOfModule(moduleCode: string) {
    return this.http.post<any>(`${environment.adminUrl}get-module-lecture-hours`, {moduleCode});
  }

  getSessions(lectureHourID, batch) {
    return this.http.post<any>(`${environment.adminUrl}get-sessions`, {lectureHourID, batch});
  }

  getTeachers() {
    return this.http.post<any>(`${environment.adminUrl}get-teachers`, {});
  }

  checkIfModuleExists(value) {
    return this.http.post<any>(`${environment.adminUrl}check-module`, {moduleCode: value});
  }

  editModule(data) {
    return this.http.post<any>(`${environment.adminUrl}add-edit-module`, data);
  }

  deleteModule(data) {
    return this.http.post<any>(`${environment.adminUrl}delete-module`, data);
  }

  uploadAttendance(data) {
    return this.http.post<any>(`${environment.adminUrl}upload-attendance`, data);
  }

  getAttendanceOfSession(data: number) {
    return this.http.post<any>(`${environment.adminUrl}get-session-attendance`, {sessionID: data});
  }

  saveAttendanceChanges(data, sessionID: number) {
    return this.http.post<any>(`${environment.adminUrl}save-attendance-changes`, {sessionID, attendance: data});
  }

  getExamsOfModule(moduleCode: string, batch: number) {
    return this.http.post<any>(`${environment.adminUrl}get-module-exams`, {moduleCode, batch});
  }

  uploadExamResults(data) {
    return this.http.post<any>(`${environment.adminUrl}upload-results`, data);
  }

  getExamResults() {
    return this.http.post<any>(`${environment.apiUrl}get-results`, {});
  }

  getResultsOfModule(data: object) {
    return this.http.post<any>(`${environment.adminUrl}get-module-results`, data);
  }

  editResults(results) {
    return this.http.post<any>(`${environment.adminUrl}edit-results`, {results});
  }

  deleteExam(data: object) {
    return this.http.post<any>(`${environment.adminUrl}delete-exam`, data);
  }

  uploadProfilePicture(profilePicture) {
    return this.http.post<any>(`${environment.apiUrl}upload-profile-picture`, {profilePicture}, {
      reportProgress: true,
      observe: 'events'
    });
  }

  getProfilePicture() {
    return this.http.post<any>(`${environment.apiUrl}get-profile-picture`, {});
  }

  registerStudent(studentDetails) {
    return this.http.post<any>(`${environment.adminUrl}register-student`, {studentDetails});
  }

  checkStudentID(studentID) {
    return this.http.post<any>(`${environment.adminUrl}check-student-id`, {studentID});
  }

  getTimetable(): Observable<any> {
    return this.http.get(`${environment.apiUrl}get-timetable`, {responseType: 'text'});
  }

  getStudents() {
    return this.http.post<any>(`${environment.teacherUrl}get-students`, {});
  }

  getNotifications() {
    return this.http.post<any>(`${environment.apiUrl}get-notifications`, {});
  }

  updateNotificationStatus(received: string[]) {
    return this.http.post<any>(`${environment.apiUrl}update-notification-status`, {received});
  }

  getStudentsOfBatch(batch: number) {
    return this.http.post<any>(`${environment.adminUrl}get-students-of-batch`, {batch});
  }

  getModulesOfSemester(semester: number) {
    return this.http.post<any>(`${environment.adminUrl}get-modules-of-semester`, {semester});
  }

  uploadRequest(requestForm: object): Observable<any> {
    return this.http.post(`${environment.apiUrl}upload-request`, requestForm, {
      reportProgress: true,
      observe: 'events'
    });
  }

  getAllRequests(): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-all-requests`, {});
  }

  enrollStudent(enrollmentForm: object): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}enroll-student`, enrollmentForm);
  }

  getResults(studentID: string): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-student-results`, {studentID});
  }

  getModuleResults(moduleCode: string): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-module-results-view`, {moduleCode});
  }

  checkIfResultsUploaded(data: object): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}check-if-results-uploaded`, data);
  }

  getRequestTypes(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}get-request-types`, {});
  }

  getRequestsBrief(studentID: string): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-requests-brief`, {studentID});
  }

  getRequestDetails(requestID: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}get-request-details`, {requestID});
  }

  updateRequestStatus(data: object): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}update-request-status`, data);
  }

  getRequests(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}get-requests`, {});
  }

  deleteRequests(requestIDs: number[]): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}delete-requests`, {requestIDs});
  }

  getRequestDocuments(data: {}): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-request-documents`, data, {
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

  checkKeyword(keyword: string) {
    return this.http.post<any>(`${environment.adminUrl}check-keyword`, {keyword});
  }

  getStudentAttendance(studentID: string): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-student-attendance`, {studentID});
  }

  getModuleAttendance(moduleCode: string): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-module-attendance`, {moduleCode});
  }

  getDetailedStudentAttendance(data: object): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-detailed-student-attendance`, data);
  }

  getDetailedModuleAttendance(data: object): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-detailed-module-attendance`, data);
  }

  deleteMessage(messageID: number): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}delete-message`, {messageID});
  }

  uploadPayment(paymentForm: {}): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}upload-payment`, paymentForm, {
      reportProgress: true,
      observe: 'events'
    });
  }

  getPayments(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}get-payments`, {});
  }

  getPaymentSlip(data: {}): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}get-payment-slip`, data, {
      reportProgress: true,
      observe: 'events'
    });
  }

  getPaymentDetails(paymentID: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}get-payment-details-payment-id`, {paymentID});
  }

  getPaymentList(data: any): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-payment-list`, data);
  }

  getPrintList(data: any): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-print-list`, data);
  }

  getStudentPaymentDetails(slipNo): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-payment-details`, {slipNo});
  }

  getStudentPaymentTot(studentID: any) {
    return this.http.post<any>(`${environment.adminUrl}get-student-payment-tot`, {studentID});
  }

  getStudentPaymentList(studentID: any): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-student-payment-details`, {studentID});
  }

  getStudentPaymentLists(): Observable<any> {
    return this.http.post<any>(`${environment.studentUrl}get-students-payment-details`, {});
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

  getEnrollments(data: object): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}get-enrollments`, data);
  }

  deleteEnrollments(enrollmentIDs: number[]): Observable<any> {
    return this.http.post<any>(`${environment.adminUrl}delete-enrollments`, {enrollmentIDs});
  }

}
