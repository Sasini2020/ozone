import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {UserDataService} from '../../../_services/user-data.service';
import {FormBuilder, FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {COMMA, ENTER, TAB} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import {DataService} from '../../../_services/data.service';
import {AuthenticationService} from '../../../_services/authentication.service';
import {NotificationService} from '../../../_services/notification.service';

export interface RecipientClass {
  classID: number;
  moduleCode: string;
  moduleName: string;
  year: number;
}

@Component({
  selector: 'app-composer',
  templateUrl: './composer.component.html',
  styleUrls: ['./composer.component.css']
})
export class ComposerComponent implements OnInit {

  separatorCodes: number[] = [ENTER, COMMA, TAB];
  filteredRecipients: Observable<RecipientClass[]>;
  recipientsClasses: RecipientClass[] = [];
  allRecipientsClasses: RecipientClass[] = [];

  recipient: FormControl = new FormControl();
  subject: FormControl = new FormControl();
  messageText: FormControl = new FormControl();

  composerProgress = false;
  invalidRecipient = false;

  @ViewChild('recipientInput') recipientInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    public userData: UserDataService,
    private authentication: AuthenticationService,
    private formBuilder: FormBuilder,
    private data: DataService,
    private notification: NotificationService
  ) {
  }

  ngOnInit(): void {
    this.composerProgress = true;
    this.data.getClasses().subscribe(
      response => {
        this.allRecipientsClasses = response.classes.sort((value1, value2) => value1.moduleCode.localeCompare(value2.moduleCode));
      },
      error => console.log(error)
    ).add(() => this.composerProgress = false);
    this.filteredRecipients = this.recipient.valueChanges.pipe(
      startWith(null),
      map((recipient: string | null) => recipient ? this._filter(recipient) : this.allRecipientsClasses.slice())
    );
  }

  sendNotification() {
    const receivers = this.recipientsClasses.map(recipientClass => recipientClass.classID);
    this.notification.sendMessage({
      notificationID: 0,
      recipients: receivers,
      username: this.username,
      subject: this.subject.value,
      message: this.messageText.value,
      timeSent: new Date(),
      timeStamp: +new Date(),
      received: false,
      status: 'sending'
    });
    this.recipient.reset();
    this.subject.reset();
    this.messageText.reset();
    this.recipientsClasses = [];
  }

  add(event: MatChipInputEvent): void {
    this.invalidRecipient = false;
    const input = event.input;
    const value = parseInt(event.value, 10);
    if (value) {
      const recipient = this.allRecipientsClasses.find(recipientClass => recipientClass.classID === value);
      if (recipient) {
        this.recipientsClasses.push(recipient);
      }
    }
    if (input) {
      input.value = '';
    }
    this.recipient.setValue(null);
  }

  remove(value: number): void {
    const index = this.recipientsClasses.indexOf(this.allRecipientsClasses.find(
      recipient => recipient.classID === value)
    );
    if (index >= 0) {
      this.recipientsClasses.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.recipientsClasses.push(this.allRecipientsClasses.find(recipient => recipient.classID === event.option.value));
    this.recipientInput.nativeElement.value = '';
    this.recipient.setValue(null);
  }

  private _filter(value: string): RecipientClass[] {
    value = value.toString().toLowerCase();
    return this.allRecipientsClasses
      .filter(
        recipientClass => recipientClass.moduleCode.toLowerCase().includes(value)
          || recipientClass.moduleName.toLowerCase().includes(value)
          || recipientClass.year.toString().includes(value)
      );
  }

  get username() {
    return this.authentication.details.username;
  }

  get getRole() {
    return this.authentication.details.role;
  }

  // submitForm() {
  //   this.registerStudentProgress = true;
  //   this.error = '';
  //   if (this.registrationForm.valid) {
  //     this.data.registerTeacher(this.registrationForm.value).subscribe(
  //       response => {
  //         if (response.status) {
  //           this.openDialog();
  //         }
  //         this.resetForm();
  //       },
  //       error => {
  //         this.success = false;
  //         this.error = error;
  //       }
  //     ).add(() => this.registerStudentProgress = false);
  //   } else {
  //     this.registerStudentProgress = false;
  //     this.scrollToFirstInvalidControl();
  //   }

  // }

}
