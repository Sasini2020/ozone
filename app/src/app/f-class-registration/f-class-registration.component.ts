import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-f-class-registration',
  templateUrl: './f-class-registration.component.html',
  styleUrls: ['./f-class-registration.component.css']
})
export class FClassRegistrationComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  classregistration= [
    {'id':1,'name':'Agricultural Science - 2022 Theory','teacher':'Prasad Pieris','image':'../../assets/teachers/prasad perera.png','fee':'2000'}
  ];
}
