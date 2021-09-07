import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {environment} from '../../environments/environment';
import {AuthenticationService} from '../_services/authentication.service';

@Component({
  selector: 'app-f-login',
  templateUrl: './f-login.component.html',
  styleUrls: ['./f-login.component.css']
})
export class FLoginComponent implements OnInit {

  loginForm: FormGroup;
  loginProgress = false;
  loginError = '';

  constructor(
    private formBuilder: FormBuilder,
    private authentication: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.pattern(environment.usernamePattern)]],
      password: ['', [Validators.required]]
    });
  }

  login(): void {
    this.loginProgress = true;
    this.loginError = '';
    this.authentication.login(this.loginForm.value).subscribe(
      response => {
        this.router.navigate(['/home']);
      },
      error => {
        this.loginError = error;
      }
    ).add(() => {
      this.loginProgress = false;
    });
  }

  get email(): AbstractControl {
    return this.loginForm.get('username');
  }

}
