import {Injectable, OnDestroy} from '@angular/core';
import {AuthenticationService} from './authentication.service';

export interface Message {
  messageType: string;
  messageBody: MessageBody | number;
}

export interface MessageBody {
  notificationID: number;
  recipients: string[];
  username: string;
  subject: string;
  message: string;
  timeSent: Date;
  timeStamp?: number;
  received: boolean;
  status: 'sent' | 'sending' | 'failed';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {

  url = 'ws://localhost:3000';
  webSocket: WebSocket;
  messages: MessageBody[] = [];
  token;

  connected = false;
  timeout = 0;
  retries = 0;
  displayConnectedMessage = 0;

  timeoutIDCountdown: number;
  timeoutIDReconnect: number;

  constructor(
    private authentication: AuthenticationService
  ) {
  }

  public openWebSocket() {

    clearTimeout(this.timeoutIDCountdown);
    clearTimeout(this.timeoutIDReconnect)
    this.connected = false;
    this.timeout = 0;
    this.displayConnectedMessage = 0;
    this.webSocket = new WebSocket('ws://localhost:3000', this.token);

    this.webSocket.onopen = (event) => {

      this.retries = 0;
      this.connected = true;
      this.displayConnectedMessage = 3;
      this.countDown();

      this.messages.filter(message => message.status === 'failed').forEach(msg => this.resendMessage(msg));

    };

    this.webSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.messageType === 'notification') {
        message.messageBody.sent = true;
        this.messages.unshift(message.messageBody);
        this.acknowledgement(message.messageBody.notificationID);
      } else if (message.messageType === 'acknowledgement') {
        setTimeout(
          () => {
            const temp = this.messages.find(msg => msg.timeStamp === message.timeStamp);
            temp.status = message.status;
            temp.notificationID = message.notificationID;
          },
          2000
        );
      }
    };

    this.webSocket.onerror = (error) => {
      if (this.webSocket.readyState === 1) {
        this.connected = false;
      }
    };

    this.webSocket.onclose = (event) => {
      this.connected = false;
      this.timeout = this.retries * 15;
      if (this.retries++ <= 3) {
        this.reconnect();
      }
    };

  }

  countDown() {
    this.timeoutIDCountdown = setTimeout(() => {
      this.displayConnectedMessage--;
      if (this.displayConnectedMessage > 0) {
        this.countDown();
      }
    }, 1000);
  }

  reconnect(): void {

    this.timeoutIDReconnect = setTimeout(() => {
      if (this.timeout-- > 0) {
        this.reconnect();
      } else {
        this.openWebSocket();
      }
    }, 1000);

  }

  resendMessage(message: MessageBody) {
    message.status = 'sending';
    const msg: Message = {
      messageType: 'notification',
      messageBody: message
    };
    if (this.connected) {
      this.webSocket.send(JSON.stringify(msg));
    } else {
      message.status = 'failed';
    }
  }

  public sendMessage(message: MessageBody) {
    this.resendMessage(message);
    this.messages.unshift(message);
  }

  private acknowledgement(messageID: number) {
    const acknowledgement: Message = {
      messageType: 'acknowledgement',
      messageBody: messageID
    };
    this.webSocket.send(JSON.stringify(acknowledgement));
  }

  public closeConnection() {
    this.webSocket.close();
  }

  get username() {
    return this.authentication.details.username;
  }

  ngOnDestroy() {
    this.webSocket.close();
  }

}

