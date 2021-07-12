import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {AuthenticationGuard} from './_helpers/authentication.guard';

import {HomeComponent} from './home/home.component';
import {LoginComponent} from './auth/login/login.component';
import {VerificationComponent} from './auth/verification/verification.component';
import {AuthComponent} from './auth/auth.component';
import {ForgotPasswordComponent} from './auth/forgot-password/forgot-password.component';
import {AttendanceComponent} from './home/attendance/attendance.component';
import {CourseModuleComponent} from './home/course-module/course-module.component';
import {TimetableComponent} from './home/timetable/timetable.component';
import {UploadAttendanceComponent} from './home/attendance/upload-attendance/upload-attendance.component';
import {EditAttendanceComponent} from './home/attendance/edit-attendance/edit-attendance.component';
import {ViewAttendanceComponent} from './home/attendance/view-attendance/view-attendance.component';
import {PaymentComponent} from './home/payment/payment.component';
import {RegistrationComponent} from './home/registration/registration.component';
import {ResultsComponent} from './home/results/results.component';
import {UploadPaymentComponent} from './home/payment/upload-payment/upload-payment.component';
import {ProfileComponent} from './home/profile/profile.component';
import {RequestComponent} from './home/request/request.component';
import {NewModuleComponent} from './home/course-module/new-module/new-module.component';
import {EnrollComponent} from './home/course-module/enroll/enroll.component';
import {ModuleDetailComponent} from './home/course-module/module-detail/module-detail.component';
import {UserGuard} from './_helpers/user.guard';
import {ExamResultsComponent} from './home/results/exam-results/exam-results.component';
import {EditResultComponent} from './home/results/edit-result/edit-result.component';
import {UploadResultComponent} from './home/results/upload-result/upload-result.component';
import {ViewResultComponent} from './home/results/view-result/view-result.component';
import {ModuleAttendanceComponent} from './home/attendance/module-attendance/module-attendance.component';
import {EditPaymentComponent} from './home/payment/edit-payment/edit-payment.component';
import {SubmitedRequestsComponent} from './home/request/submited-requests/submited-requests.component';
import {AddRequestComponent} from './home/request/add-request/add-request.component';
import {UpdateStatusComponent} from './home/request/update-status/update-status.component';
import {ResetPasswordComponent} from './auth/reset-password/reset-password.component';
import {AcademicTimetableComponent} from './home/timetable/academic-timetable/academic-timetable.component';
import {AcademicCalenderComponent} from './home/timetable/academic-calender/academic-calender.component';
import {DeactivateGuard} from './_helpers/deactivate.guard';
import {EditProfileComponent} from './home/profile/edit-profile/edit-profile.component';
import {ChangeRecoveryEmailComponent} from './auth/change-recovery-email/change-recovery-email.component';
import {ViewPaymentsHomeComponent} from './home/payment/view-payments-home/view-payments-home.component';
import {ViewPaymentDetailsComponent} from './home/payment/view-payments-home/view-payment-details/view-payment-details.component';
import {ViewPaymentsComponent} from './home/payment/view-payments-home/view-payments/view-payments.component';
import {ViewRegistrationComponent} from './home/registration/view-registration/view-registration.component';
import {NewRegistrationComponent} from './home/registration/new-registration/new-registration.component';
import {PaymentHistoryComponent} from './home/payment/payment-history/payment-history.component';
import {NewRequestsComponent} from './home/request/new-requests/new-requests.component';
import {ViewEnrollmentComponent} from './home/course-module/view-enrollment/view-enrollment.component';


import {FHomeComponent} from './f-home/f-home.component';
import {FClassComponent} from './f-class/f-class.component';
import {FLoginComponent} from './f-login/f-login.component';
import {FAboutComponent} from './f-about/f-about.component';
import {FRegisterComponent} from './f-register/f-register.component';
import {FClassRegistrationComponent} from './f-class-registration/f-class-registration.component';
import {FTeachersComponent} from './f-teachers/f-teachers.component';
import {FAchievementComponent} from './f-achievement/f-achievement.component';


const routes: Routes = [
  {
    path: '',
    component: FHomeComponent
  },
  {
    path: 'class',
    component: FClassComponent
  },
  {
    path: 'login',
    component: FLoginComponent
  },
  {
    path: 'verify-email',
    component: VerificationComponent
  },
  {
    path: 'about',
    component: FAboutComponent
  },
  {
    path: 'register',
    component: FRegisterComponent
  },
  {
    path: 'classregistration',
    component: FClassRegistrationComponent
  },
  {
    path: 'teachers',
    component: FTeachersComponent
  },
  {
    path: 'achievement',
    component: FAchievementComponent
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthenticationGuard],
    children: [
      {
        path: 'attendance',
        component: AttendanceComponent,
        children: [
          {
            path: 'module-attendance',
            component: ModuleAttendanceComponent
          },
          {
            path: '',
            redirectTo: 'module-attendance',
            pathMatch: 'full'
          },
          {
            path: 'module-attendance/:moduleCode',
            component: ModuleAttendanceComponent
          },
          {
            path: 'view-attendance',
            component: ViewAttendanceComponent,
            canActivate: [UserGuard]
          },
          {
            path: 'upload-attendance',
            component: UploadAttendanceComponent,
            canActivate: [UserGuard]
          },
          {
            path: 'edit-attendance',
            component: EditAttendanceComponent,
            canActivate: [UserGuard]
          }
        ]
      },
      {
        path: 'course-modules',
        component: CourseModuleComponent,
        children: [
          {
            path: 'module-details',
            component: ModuleDetailComponent
          },
          {
            path: '',
            redirectTo: 'module-details',
            pathMatch: 'full'
          },
          {
            path: 'new-module',
            component: NewModuleComponent,
            canActivate: [UserGuard]
          },
          {
            path: 'enroll',
            component: EnrollComponent,
            canActivate: [UserGuard]
          },
          {
            path: 'view-enrollments',
            component: ViewEnrollmentComponent,
            canActivate: [UserGuard]
          }
        ]
      },
      {
        path: 'results',
        component: ResultsComponent,
        children: [
          {
            path: 'exam-results',
            component: ExamResultsComponent
          },
          {
            path: '',
            redirectTo: 'exam-results',
            pathMatch: 'full'
          },
          {
            path: 'exam-results:moduleCode',
            component: ExamResultsComponent
          },
          {
            path: 'view-results',
            component: ViewResultComponent,
            canActivate: [UserGuard]
          },
          {
            path: 'upload-results',
            component: UploadResultComponent,
            canActivate: [UserGuard]
          },
          {
            path: 'edit-results',
            component: EditResultComponent,
            canActivate: [UserGuard]
          }
        ]
      },
      {
        path: 'results/:moduleCode',
        component: ResultsComponent
      },
      {
        path: 'timetable',
        component: TimetableComponent,
        children: [
          {
            path: '',
            redirectTo: 'academic-timetable',
            pathMatch: 'full'
          },
          {
            path: 'academic-timetable',
            component: AcademicTimetableComponent
          },
          {
            path: 'academic-calender',
            component: AcademicCalenderComponent,
            canDeactivate: [DeactivateGuard]
          }]
      },
      {
        path: 'payment',
        component: PaymentComponent,
        children: [
          {
            path: '',
            redirectTo: 'payment-history',
            pathMatch: 'full'
          },
          {
            path: 'payment-history',
            component: PaymentHistoryComponent
          },
          {
            path: 'view-payments-home',
            component: ViewPaymentsHomeComponent,
            children: [
              {
                path: 'view-payment-details',
                component: ViewPaymentDetailsComponent,
              },
              {
                path: 'view-payments',
                component: ViewPaymentsComponent,
              }
            ]
          },
          {
            path: 'upload-payment',
            component: UploadPaymentComponent
          },
          {
            path: 'edit-payment',
            component: EditPaymentComponent
          }
        ]
      },
      {
        path: 'registration',
        component: RegistrationComponent,
        children: [
          {
            path: 'view-registration',
            component: ViewRegistrationComponent
          },
          {
            path: 'new-registration',
            component: NewRegistrationComponent
          }
        ]
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'edit-profile',
        component: EditProfileComponent
      },
      {
        path: 'request',
        component: RequestComponent,
        children: [
          {
            path: 'submitted-requests',
            component: SubmitedRequestsComponent
          },
          {
            path: '',
            redirectTo: 'submitted-requests',
            pathMatch: 'full'
          },
          {
            path: 'add-request',
            component: AddRequestComponent
          },
          {
            path: 'update-status',
            component: UpdateStatusComponent
          },
          {
            path: 'new-requests',
            component: NewRequestsComponent
          }
        ]
      },
      {
        path: '',
        redirectTo: 'course-modules',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'verification',
    component: VerificationComponent,
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent
      },
      {
        path: 'reset-password/:token',
        component: ResetPasswordComponent
      },
      {
        path: 'verification',
        component: VerificationComponent
      },
      {
        path: 'verification/:email',
        component: VerificationComponent
      },
      {
        path: 'change-recovery-email',
        component: ChangeRecoveryEmailComponent
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
