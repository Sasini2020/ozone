import {Component, ElementRef, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DataService} from '../../../_services/data.service';
import {AuthenticationService} from '../../../_services/authentication.service';
import {UserDataService} from '../../../_services/user-data.service';
import {Router} from '@angular/router';
import {PasswordValidator} from '../../../_services/shared.service';

interface EditGeneralSettings {
  phone: FieldData;
  address: FieldData;
}

interface FieldData {
  updated?: boolean;
  progress?: boolean;
  success?: boolean;
  error?: string;
}

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  progress: boolean;
  error = '';

  success = false;
  passwordUpdateError = '';
  passwordUpdateProgress = false;

  currentRecoveryEmail: string;

  recoveryEmail: FormControl = new FormControl(['', [Validators.required, Validators.email]]);
  isRecoveryEmailEdited: FieldData = {};

  editGeneralSettings: FormGroup;
  isGeneralSettingsEdited: EditGeneralSettings = {
    phone: {},
    address: {}
  };
  passwordConstraints = {
    length: false,
    capitalLetters: false,
    numbers: false,
    symbols: false
  };
  passwordVisible = {
    currentPassword: false,
    password: false,
    confirmPassword: false
  };

  editPasswordForm: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    public elementRef: ElementRef,
    private data: DataService,
    private authentication: AuthenticationService,
    private userData: UserDataService,
    private router: Router
  ) {
  }

  ngOnInit(): void {

    this.progress = true;
    this.userData.getUserDetails().subscribe(
      response => {
        this.fullName.setValue(response.details.fullName);
        this.username.setValue(response.details.username);
        this.email.setValue(response.details.email);
        this.phone.setValue(response.details.mobile);
        this.address.setValue(response.details.address);
        this.currentRecoveryEmail = response.details.recoveryEmail;
        this.recoveryEmail.setValue(response.details.recoveryEmail);
      },
      error => {
        this.error = error;
      }
    ).add(() => this.progress = false);

    this.editGeneralSettings = this.formBuilder.group({
      fullName: ['A.K.V Jayasanka'],
      username: ['184061R'],
      email: [''],
      phone: ['', [Validators.required, Validators.pattern(/^(0[1-9]{9})|(\+94[1-9]{9})$/)]],
      address: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.editPasswordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=(.*[a-z])+)(?=(.*[\d])+)(?=(.*[\W])+)(?!.*\s).{8,}$/)]],
      confirmPassword: ['', Validators.required]
    }, {validator: PasswordValidator});

    this.password.valueChanges.subscribe(value => {
      this.passwordConstraints.capitalLetters = /[A-Z]+/.test(value);
      this.passwordConstraints.numbers = /[0-9]+/.test(value);
      this.passwordConstraints.length = value.length >= 8;
      this.passwordConstraints.symbols = /[-@#!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(value);
    });

  }

  saveGeneralSettingsChanges(target, value: string): void {
    if (this.isGeneralSettingsEdited[target.id].updated) {
      this.isGeneralSettingsEdited[target.id] = {
        updated: true,
        progress: true,
        success: false,
        error: ''
      };
      this.userData.updateUserData({[target.id]: value}).subscribe(
        response => {
          this.isGeneralSettingsEdited[target.id].updated = false;
          this.isGeneralSettingsEdited[target.id].success = true;
        }, error => {
          this.isGeneralSettingsEdited[target.id].error = error;
        }
      ).add(() => this.isGeneralSettingsEdited[target.id].progress = false);
    } else {
      this.elementRef.nativeElement.querySelector(`#${target.id}-input`).focus();
      this.isGeneralSettingsEdited[target.id].updated = true;
      this.isGeneralSettingsEdited[target.id].success = false;
    }
  }

  editRecoveryEmail(): void {
    if (this.isRecoveryEmailEdited.updated) {
      this.isRecoveryEmailEdited.progress = true;
      if (this.recoveryEmail.value !== this.currentRecoveryEmail) {
        this.router.navigate(['../auth/change-recovery-email', {email: this.recoveryEmail.value.trim()}]);
      } else {
        this.isRecoveryEmailEdited.updated = false;
        this.isRecoveryEmailEdited.progress = false;
      }
    } else {
      this.isRecoveryEmailEdited.updated = true;
      this.elementRef.nativeElement.querySelector('#recovery-email-input').focus();
    }
  }

  changePassword(): void {
    this.success = false;
    this.passwordUpdateError = '';
    this.passwordUpdateProgress = true;
    this.authentication.changePassword({
      currentPassword: this.currentPassword.value,
      newPassword: this.password.value,
      confirmPassword: this.confirmPassword.value
    }).subscribe(
      response => {
        this.success = true;
      },
      error => {
        this.passwordUpdateError = error;
      }
    ).add(() => this.passwordUpdateProgress = false);
  }

  get getRole(): string {
    return this.authentication.details.role;
  }

  get fullName(): AbstractControl {
    return this.editGeneralSettings.get('fullName');
  }

  get username(): AbstractControl {
    return this.editGeneralSettings.get('username');
  }

  get email(): AbstractControl {
    return this.editGeneralSettings.get('email');
  }

  get phone(): AbstractControl {
    return this.editGeneralSettings.get('phone');
  }

  get address(): AbstractControl {
    return this.editGeneralSettings.get('address');
  }

  get currentPassword(): AbstractControl {
    return this.editPasswordForm.get('currentPassword');
  }

  get password(): AbstractControl {
    return this.editPasswordForm.get('password');
  }

  get confirmPassword(): AbstractControl {
    return this.editPasswordForm.get('confirmPassword');
  }

}
