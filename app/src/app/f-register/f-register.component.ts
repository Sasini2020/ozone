import {Component, ElementRef, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {AuthenticationService} from '../_services/authentication.service';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-f-register',
  templateUrl: './f-register.component.html',
  styleUrls: ['./f-register.component.css']
})
export class FRegisterComponent implements OnInit {

  registrationForm: FormGroup;
  registrationProgress = false;
  registrationError = '';

  emailExistsError = false;

  success = false;
  timeout = 5;

  passwordConstraints = {
    length: false,
    capitalLetters: false,
    numbers: false,
    symbols: false
  };

  constructor(
    private formBuilder: FormBuilder,
    private elementRef: ElementRef,
    private authentication: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit(): void {

    this.registrationForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(environment.passwordValidator)]],
      confirmPassword: ['', [Validators.required, Validators.pattern(environment.passwordValidator)]],
      phone: ['', [Validators.required, Validators.pattern(environment.phoneValidator)]],
      school: ['', [Validators.required]],
      stream: ['', [Validators.required]],
      year: ['', [Validators.required]],
      district: ['', [Validators.required]]
    });

    this.password.valueChanges.subscribe(value => {
      if (this.confirmPassword.touched && value !== this.confirmPassword.value) {
        this.confirmPassword.setErrors({incorrect: true});
      } else {
        this.confirmPassword.setErrors(null);
      }
    });

    this.confirmPassword.valueChanges.subscribe(value => {
      if (this.password.touched && this.password.value !== value) {
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

  register() {
    this.registrationError = '';
    if (this.registrationForm.valid) {
      this.registrationProgress = true;
      this.authentication.registerStudent(this.registrationForm.value).subscribe(
        response => {
          this.success = true;
          const timer = setInterval(() => {
            if (this.timeout === 0) {
              clearInterval(timer);
              this.router.navigate(['/login']);
            } else {
              this.timeout--;
            }
          }, 1000);
        },
        error => {
          this.registrationError = error;
        }
      ).add(() => this.registrationProgress = false);
    } else {
      const firstInvalidControl: HTMLElement = this.elementRef.nativeElement.querySelector('form .ng-invalid');
      firstInvalidControl.scrollIntoView({behavior: 'smooth'});
    }
  }

  get firstName(): AbstractControl {
    return this.registrationForm.get('firstName');
  }

  get lastName(): AbstractControl {
    return this.registrationForm.get('lastName');
  }

  get email(): AbstractControl {
    return this.registrationForm.get('email');
  }

  get password(): AbstractControl {
    return this.registrationForm.get('password');
  }

  get confirmPassword(): AbstractControl {
    return this.registrationForm.get('confirmPassword');
  }

  get phone(): AbstractControl {
    return this.registrationForm.get('phone');
  }

  get school(): AbstractControl {
    return this.registrationForm.get('school');
  }

  get stream(): AbstractControl {
    return this.registrationForm.get('stream');
  }

  get year(): AbstractControl {
    return this.registrationForm.get('year');
  }

  get district(): AbstractControl {
    return this.registrationForm.get('district');
  }

}
