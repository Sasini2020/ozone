import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {MaterialModule} from './_material/material.module';
import {EjsModule} from './_ejs/ejs.module';
import {AppRoutingModule} from './app-routing.module';
import {AuthenticationService} from './_services/authentication.service';
import {AuthenticationGuard} from './_helpers/authentication.guard';
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './auth/login/login.component';
import {TokenInterceptor} from './_helpers/token.interceptor';
import {ErrorInterceptor} from './_helpers/error.interceptor';
import {VerificationComponent} from './auth/verification/verification.component';
import {AuthComponent} from './auth/auth.component';
import {ForgotPasswordComponent} from './auth/forgot-password/forgot-password.component';
import {AttendanceComponent} from './home/attendance/attendance.component';
import {CourseModuleComponent, DeleteModuleDialogComponent} from './home/course-module/course-module.component';
import {TimetableComponent} from './home/timetable/timetable.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {UploadAttendanceComponent} from './home/attendance/upload-attendance/upload-attendance.component';
import {EditAttendanceComponent} from './home/attendance/edit-attendance/edit-attendance.component';
import {DetailedModuleAttendanceComponent, ViewAttendanceComponent} from './home/attendance/view-attendance/view-attendance.component';
import {ConfirmUploadDialogComponent, PaymentComponent} from './home/payment/payment.component';
import {NotificationComponent, NotificationDialogComponent} from './home/notification/notification.component';
import {ConfirmDetailsDialogComponent, ProfileDetailsDialogComponent, RegistrationComponent} from './home/registration/registration.component';
import {ResultsComponent} from './home/results/results.component';
import {UploadResultComponent} from './home/results/upload-result/upload-result.component';
import {EditResultComponent} from './home/results/edit-result/edit-result.component';
import {ViewResultComponent} from './home/results/view-result/view-result.component';
import {ProfileComponent} from './home/profile/profile.component';
import {ProfilePictureComponent} from './home/profile/profile-picture/profile-picture.component';
import {ImageCropperModule} from 'ngx-image-cropper';
import {ComposerComponent} from './home/notification/composer/composer.component';
import {RequestComponent} from './home/request/request.component';
import {AddRequestComponent, ImagePreviewDialogComponent} from './home/request/add-request/add-request.component';
import {UpdateStatusComponent} from './home/request/update-status/update-status.component';
import {EnrollComponent} from './home/course-module/enroll/enroll.component';
import {NewModuleComponent} from './home/course-module/new-module/new-module.component';
import {ModuleDetailComponent} from './home/course-module/module-detail/module-detail.component';
import {UserGuard} from './_helpers/user.guard';
import {ExamResultsComponent} from './home/results/exam-results/exam-results.component';
import {AttendanceDialogComponent, ModuleAttendanceComponent} from './home/attendance/module-attendance/module-attendance.component';
import {SubmitedRequestsComponent} from './home/request/submited-requests/submited-requests.component';
import {ResetPasswordComponent} from './auth/reset-password/reset-password.component';
import {AcademicTimetableComponent} from './home/timetable/academic-timetable/academic-timetable.component';
import {AcademicCalenderComponent, NewAcademicYearDialogComponent} from './home/timetable/academic-calender/academic-calender.component';
import {DayMarkersService, EditService, FilterService, SelectionService, SortService, ToolbarService} from '@syncfusion/ej2-angular-gantt';
import {DeactivateGuard} from './_helpers/deactivate.guard';
import { EditProfileComponent } from './home/profile/edit-profile/edit-profile.component';
import { ChangeRecoveryEmailComponent } from './auth/change-recovery-email/change-recovery-email.component';
import { EditPaymentComponent } from './home/payment/edit-payment/edit-payment.component';
import { UploadPaymentComponent } from './home/payment/upload-payment/upload-payment.component';
import {ConfirmDeleteDialogComponent, ConfirmUpdateDialogComponent, ViewPaymentsHomeComponent} from './home/payment/view-payments-home/view-payments-home.component';
import { ViewPaymentDetailsComponent } from './home/payment/view-payments-home/view-payment-details/view-payment-details.component';
import { ViewPaymentsComponent } from './home/payment/view-payments-home/view-payments/view-payments.component';
import {DatePipe} from '@angular/common';
import { NewRegistrationComponent } from './home/registration/new-registration/new-registration.component';
import { ViewRegistrationComponent } from './home/registration/view-registration/view-registration.component';
import { PaymentHistoryComponent } from './home/payment/payment-history/payment-history.component';
import { NewRequestsComponent } from './home/request/new-requests/new-requests.component';

import { HashLocationStrategy, LocationStrategy} from '@angular/common';
import { ViewEnrollmentComponent } from './home/course-module/view-enrollment/view-enrollment.component';
import { FHomeComponent } from './f-home/f-home.component';
import { FAboutComponent } from './f-about/f-about.component';
import { FClassComponent } from './f-class/f-class.component';
import { FClassRegistrationComponent } from './f-class-registration/f-class-registration.component';
import { FTeachersComponent } from './f-teachers/f-teachers.component';
import { FLoginComponent } from './f-login/f-login.component';
import { FRegisterComponent } from './f-register/f-register.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { FAchievementComponent } from './f-achievement/f-achievement.component';

//import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    VerificationComponent,
    AuthComponent,
    ForgotPasswordComponent,
    CourseModuleComponent,
    TimetableComponent,
    DeleteModuleDialogComponent,
    AttendanceComponent,
    UploadAttendanceComponent,
    EditAttendanceComponent,
    ViewAttendanceComponent,
    AttendanceDialogComponent,
    NotificationComponent,
    PaymentComponent,
    NotificationComponent,
    RegistrationComponent,
    ResultsComponent,
    UploadResultComponent,
    EditResultComponent,
    ViewResultComponent,
    ProfileComponent,
    ProfilePictureComponent,
    ComposerComponent,
    RequestComponent,
    AddRequestComponent,
    UpdateStatusComponent,
    EnrollComponent,
    NewModuleComponent,
    ModuleDetailComponent,
    ExamResultsComponent,
    ModuleAttendanceComponent,
    SubmitedRequestsComponent,
    ResetPasswordComponent,
    AcademicTimetableComponent,
    AcademicCalenderComponent,
    NewAcademicYearDialogComponent,
    DetailedModuleAttendanceComponent,
    EditProfileComponent,
    ChangeRecoveryEmailComponent,
    EditPaymentComponent,
    UploadPaymentComponent,
    ViewPaymentsHomeComponent,
    ConfirmUploadDialogComponent,
    ConfirmUpdateDialogComponent,
    ConfirmDeleteDialogComponent,
    ViewPaymentDetailsComponent,
    ViewPaymentsComponent,
    NewRegistrationComponent,
    ViewRegistrationComponent,
    ConfirmDetailsDialogComponent,
    ProfileDetailsDialogComponent,
    PaymentHistoryComponent,
    ImagePreviewDialogComponent,
    NewRequestsComponent,
    NotificationDialogComponent,
    ViewEnrollmentComponent,
    FHomeComponent,
    FAboutComponent,
    FClassComponent,
    FClassRegistrationComponent,
    FTeachersComponent,
    FLoginComponent,
    FRegisterComponent,
    NavbarComponent,
    FooterComponent,
    FAchievementComponent,
   
  ],
  imports: [
   
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    EjsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatAutocompleteModule,
    ImageCropperModule,
  
  ],
  providers: [
    AuthenticationGuard,
    DeactivateGuard,
    UserGuard,
    AuthenticationService,
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    EditService,
    FilterService,
    SortService,
    SelectionService,
    ToolbarService,
    DayMarkersService

  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
