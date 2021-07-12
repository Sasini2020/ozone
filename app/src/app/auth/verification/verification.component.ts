import {AfterContentInit, AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../_services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatStepper} from '@angular/material/stepper';
import {PasswordValidator} from '../../_services/shared.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})
export class VerificationComponent implements OnInit, AfterViewInit {

  @ViewChild('stepper') stepper: MatStepper;

  emailForm: FormGroup;
  newPasswordForm: FormGroup;
  error = '';
  progress = false;
  emailSent = false;
  success = false;
  wait = 0;

  token: string;
  recoveryEmail: string;

  passwordConstraints = {
    length: false,
    capitalLetters: false,
    numbers: false,
    symbols: false
  };

  passwordVisible = {
    password: false,
    confirmPassword: false
  };

  constructor(
    private formBuilder: FormBuilder,
    private authentication: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.route.params.subscribe(params => {
      this.recoveryEmail = params.email;
      this.token = params.token;
    });

    this.emailForm = this.formBuilder.group({
      email: [this.recoveryEmail ? this.recoveryEmail : '', [Validators.required, Validators.email]]
    });

    this.newPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=(.*[a-z])+)(?=(.*[\d])+)(?=(.*[\W])+)(?!.*\s).{8,}$/)]],
      confirmPassword: ['', [Validators.required]]
    }, {validator: PasswordValidator});

    this.confirmPassword.valueChanges.subscribe(value => {
      if (this.password.touched && this.password.value !== this.confirmPassword.value) {
        this.confirmPassword.setErrors({incorrect: true});
      } else {
        this.confirmPassword.setErrors(null);
      }
    });

    this.password.valueChanges.subscribe(value => {
      this.passwordConstraints.capitalLetters = /[A-Z]+/.test(value);
      this.passwordConstraints.numbers = /[0-9]+/.test(value);
      this.passwordConstraints.length = value.length >= 8;
      this.passwordConstraints.symbols = /[-@#!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(value);
    });

  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.recoveryEmail) {
      this.stepper.selectedIndex = 1;
    }
  }

  sendVerificationEmail(): void {
    this.progress = true;
    this.error = '';
    this.authentication.sendVerificationEmail(this.emailForm.value).subscribe(
      response => {
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

  resetPassword(): void {
    this.error = '';
    this.progress = true;
    const data = {
      password: this.password.value,
      token: this.token
    };
    this.authentication.changePasswordVerification(data).subscribe(
      response => {
        this.success = true;
        this.wait = 5;
        this.redirect();
      },
      error => {
        this.success = false;
        this.error = error;
      }
    ).add(() => this.progress = false);
  }

  countDown(): void {
    setTimeout(() => {
      this.wait -= 1;
      if (this.wait !== 0) {
        this.countDown();
      }
    }, 1000);
  }

  redirect(): void {
    setTimeout(() => {
      this.wait -= 1;
      if (this.wait !== 0) {
        this.redirect();
      } else {
        this.router.navigate(['/']);
      }
    }, 1000);
  }

  get email() {
    return this.emailForm.get('email');
  }

  get password(): AbstractControl {
    return this.newPasswordForm.get('password');
  }

  get confirmPassword(): AbstractControl {
    return this.newPasswordForm.get('confirmPassword');
  }

}
