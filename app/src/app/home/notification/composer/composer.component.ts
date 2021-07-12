import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {UserDataService} from '../../../_services/user-data.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {COMMA, ENTER, TAB} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import {DataService} from '../../../_services/data.service';
import {YEARS} from '../../../_services/shared.service';
import {AuthenticationService} from '../../../_services/authentication.service';
import {NotificationService} from '../../../_services/notification.service';

export interface Recipient {
  username: string;
  nameWithInitials: string;
}

@Component({
  selector: 'app-composer',
  templateUrl: './composer.component.html',
  styleUrls: ['./composer.component.css']
})
export class ComposerComponent implements OnInit {

  separatorCodes: number[] = [ENTER, COMMA, TAB];
  filteredRecipients: Observable<Recipient[]>;
  recipients: Recipient[] = [];
  allRecipients: Recipient[] = [];

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
    for (const year of YEARS) {
      this.allRecipients.push({
        username: year.toString(),
        nameWithInitials: 'Batch ' + year.toString().substring(2, 4)
      });
    }
    this.composerProgress = true;
    this.data.getStudents().subscribe(
      response => {
        this.allRecipients = this.allRecipients.concat(response.students)
          .sort((value1, value2) => value1.username.localeCompare(value2.username));
      },
      error => console.log(error)
    ).add(() => this.composerProgress = false);
    this.filteredRecipients = this.recipient.valueChanges.pipe(
      startWith(null),
      map((recipient: string | null) => recipient ? this._filter(recipient) : this.allRecipients.slice())
    );
  }

  sendNotification() {
    const receivers =  this.recipients.map(recipient => recipient.username);
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
    this.recipients = [];
  }

  add(event: MatChipInputEvent): void {
    this.invalidRecipient = false;
    const input = event.input;
    const value = event.value;
    if ((value || '').trim()) {
      const recipient = this.allRecipients.find(recip => recip.username === value.trim());
      if (recipient) {
        this.recipients.push(recipient);
      } else {
        this.recipients.push({
          username: value.trim(),
          nameWithInitials: ''
        });
      }
    }
    if (input) {
      input.value = '';
    }
    this.recipient.setValue(null);
  }

  remove(value: string): void {
    const index = this.recipients.indexOf(this.allRecipients.find(recipient => recipient.username === value.trim()));
    if (index >= 0) {
      this.recipients.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.recipients.push(this.allRecipients.find(recipient => recipient.username === event.option.value));
    this.recipientInput.nativeElement.value = '';
    this.recipient.setValue(null);
  }

  private _filter(value: string): Recipient[] {
    value = value.toLowerCase();
    return this.allRecipients
      .filter(recipient => recipient.nameWithInitials.toLowerCase().includes(value) || recipient.username.toLowerCase().includes(value));
  }

  get username() {
    return this.authentication.details.username;
  }

  get getRole() {
    return this.authentication.details.role;
  }

}
