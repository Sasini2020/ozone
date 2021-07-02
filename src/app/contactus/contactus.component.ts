import { Component, OnInit } from '@angular/core';
import { faEnvelope, faPhone,faMapMarkedAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.css']
})
export class ContactusComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  faMapMarkedAlt = faMapMarkedAlt;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
}
