import {AfterViewChecked, Component, ElementRef, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {PasswordValidator} from '../../_services/shared.service';
import {AuthenticationService} from '../../_services/authentication.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  error = '';
  progress = false;
  successful = false;

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

  token: string;
  passwordResetForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authentication: AuthenticationService
  ) {

    this.passwordResetForm = this.formBuilder.group({
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

    this.route.params.subscribe(params => {
      this.token = params.token;
    });

    if (!this.token) {
      this.router.navigate(['../forgot-password'], {relativeTo: this.route});
    }

  }

  resetPassword(): void {
    this.progress = true;
    const data = {
      password: this.password.value,
      token: this.token
    };
    this.authentication.resetPassword(data).subscribe(
      response => this.successful = true,
      error => this.error = error
    ).add(() => this.progress = false);
  }

  get password(): AbstractControl {
    return this.passwordResetForm.get('password');
  }

  get confirmPassword(): AbstractControl {
    return this.passwordResetForm.get('confirmPassword');
  }

}
