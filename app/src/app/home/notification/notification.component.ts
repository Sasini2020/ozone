import {Component, DoCheck, ElementRef, EventEmitter, Inject, IterableDiffers, OnDestroy, OnInit, Output} from '@angular/core';
import {MessageBody, NotificationService} from '../../_services/notification.service';
import {FormBuilder} from '@angular/forms';
import {AuthenticationService} from '../../_services/authentication.service';
import {UserDataService} from '../../_services/user-data.service';
import {DataService} from '../../_services/data.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DetailedModuleAttendance} from '../attendance/view-attendance/view-attendance.component';
import {AttendanceDialogComponent} from '../attendance/module-attendance/module-attendance.component';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy, DoCheck {

  differ: any;

  @Output() newNotifications = new EventEmitter<number>();

  constructor(
    public notification: NotificationService,
    private elementRef: ElementRef,
    private formBuilder: FormBuilder,
    private authentication: AuthenticationService,
    public userData: UserDataService,
    private data: DataService,
    private differs: IterableDiffers,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.differ = differs.find(this.notification.messages).create(null);
  }

  ngDoCheck() {
    this.newNotifications.emit(this.notification.messages.filter(message => !message.received && message.status === 'sent').length);
  }

  ngOnInit(): void {
    this.notification.token = null;
    this.notification.token = this.authentication.token;
    this.notification.openWebSocket();
    this.data.getNotifications().subscribe(
      response => {
        this.notification.messages = response.notifications.map(notification => {
          return {
            notificationID: notification.notificationID,
            recipients: notification.recipients,
            username: notification.sender,
            subject: notification.subject,
            message: notification.message,
            timeSent: new Date(notification.timeSent),
            received: notification.received,
            status: 'sent'
          };
        });
        this.notification.messages.sort((t1, t2) => t1 > t2 ? 1 : -1);
        const received: string[] = response.notifications.filter(notification => !notification.received)
          .map(notification => notification.notificationID);
        if (received.length !== 0) {
          this.data.updateNotificationStatus(received).subscribe();
        }
      },
      error => console.log(error)
    );
  }

  deleteMessage(i: number): void {
    if (confirm('Are you sure, you want to delete this message?')) {
      if (this.notification.messages[i].status) {
        this.data.deleteMessage(this.notification.messages[i].notificationID).subscribe(
          response => {
            this.notification.messages.splice(i, i + 1);
            this.snackBar.open('Message deleted', 'Close', {
              duration: 3000
            });
          }, error => {
            this.snackBar.open('Could not delete the message', 'Close', {
              duration: 3000
            });
          }
        );
      } else {
        this.notification.messages.splice(i, i + 1);
      }
    }
  }

  sendAgain(i: number): void {
    const message = this.notification.messages[i];
    this.notification.messages.splice(i, i + 1);
    this.notification.sendMessage(message);
  }

  reconnect(): void {
    this.notification.retries = 0;
    this.notification.openWebSocket();
  }

  ngOnDestroy() {
    this.notification.closeConnection();
  }

  get getRole() {
    return this.authentication.details.role;
  }

  get username() {
    return this.authentication.details.username;
  }

  get fullName() {
    const details = this.authentication.details;
    return details.firstName + ' ' + details.lastName;
  }

  openNotificationDialog(data: object): void {
    this.dialog.open(NotificationDialogComponent, {
      width: '400px',
      maxHeight: '700px',
      data
    });
  }

}

@Component({
  selector: 'app-notification-dialog',
  templateUrl: './notification-dialog.component.html',
  styleUrls: ['./notification.component.css']
})

export class NotificationDialogComponent implements OnInit {

  error = false;
  progress = false;

  constructor(
    public dialogRef: MatDialogRef<NotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MessageBody
  ) {
  }

  ngOnInit() {
  }

  onNoClick() {
    this.dialogRef.close();
  }

}
