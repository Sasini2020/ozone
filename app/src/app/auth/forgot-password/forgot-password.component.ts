import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../_services/authentication.service';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  usernameForm: FormGroup;
  error = '';
  progress = false;
  emailSent = false;
  wait = 0;

  constructor(
    private router: Router,
    private authentication: AuthenticationService,
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.usernameForm = this.formBuilder.group({
      username: ['', Validators.required]
    });
  }

  checkUsername() {
    this.error = '';
    this.progress = true;
    this.authentication.sendPasswordResetEmail(this.username.value).subscribe(
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

  countDown(): void {
    setTimeout(() => {
      this.wait -= 1;
      if (this.wait !== 0) {
        this.countDown();
      }
    }, 1000);
  }

  get username() {
    return this.usernameForm.get('username');
  }

}
