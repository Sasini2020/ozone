import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {AuthenticationService} from '../../_services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-change-recovery-email',
  templateUrl: './change-recovery-email.component.html',
  styleUrls: ['./change-recovery-email.component.css']
})

/**
 * @Description
 * Changes the recovery email by verifying the email entered
 */
export class ChangeRecoveryEmailComponent implements OnInit {

  recoveryEmail: FormControl = new FormControl(['', [Validators.required, Validators.email]]);
  error = '';
  progress = false;
  emailSent = false;
  success = false;
  wait = 0;

  token: string;
  email: string;

  constructor(
    private authentication: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe(params => {
      this.email = params.email;
      this.token = params.token;
    });
  }

  ngOnInit(): void {
    this.success = false;
    this.error = '';
    this.recoveryEmail.setValue(this.email);
    if (this.token) {
      this.progress = true;
      this.authentication.verifyRecoveryEmail(this.token).subscribe(
        response => {
          this.success = true;
          this.wait = 5;
          this.redirect();
        },
        error => {
          this.error = error;
        }
      ).add(() => this.progress = false);
    }
  }

  sendVerificationEmail(): void {
    this.progress = true;
    this.error = '';
    this.authentication.sendRecoveryEmailVerification(this.recoveryEmail.value).subscribe(
      response => {
        console.log(response);
        this.emailSent = true;
        this.wait = 30;
        this.countDown();
      },
      error => {
        this.emailSent = false;
        this.error = error;
      }
    ).add(() => this.progress = false);
  }

  redirect(): void {
    setTimeout(() => {
      this.wait -= 1;
      if (this.wait > 0) {
        this.redirect();
      } else {
        this.router.navigate(['./../../home']);
      }
    }, 1000);
  }

  countDown(): void {
    setTimeout(() => {
      this.wait -= 1;
      if (this.wait !== 0) {
        this.countDown();
      }
    }, 1000);
  }

}

