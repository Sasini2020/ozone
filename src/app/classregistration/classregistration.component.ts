import { Component, OnInit } from '@angular/core';
import { faCoins } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-classregistration',
  templateUrl: './classregistration.component.html',
  styleUrls: ['./classregistration.component.css']
})
export class ClassregistrationComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  classregistration= [
    {'id':1,'name':'Agricultural Science - 2022 Theory','teacher':'Prasad Pieris','image':'../../assets/teachers/prasad perera.png','fee':'2000'}
  ];
  faCoins = faCoins;

}
