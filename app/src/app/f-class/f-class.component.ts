import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-f-class',
  templateUrl: './f-class.component.html',
  styleUrls: ['./f-class.component.css']
})
export class FClassComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  
  data!: string;

  class= [
    {'id':1,'name':'Agricultural Science - 2022 Theory','description':'Agricultural Science 2022 Theory','teacher':'Srinath Siriwardana'},
    {'id':2,'name':'Accounting - 2022 A/L (Theory/ Revision)','description':'Accounting 2022','teacher':'Michel Anne'},
    {'id':3,'name':'Applied Mathematics - 2021 Revision','description':'Applied Mathematics','teacher':'Nimal Shantha'},
    {'id':4,'name':'BC Studies - 2021 (Theory / Revision / Paper)','description':'BC -2021 (Theory / Revision)','teacher':'Prasad Silva'},
    {'id':5,'name':'Bio System Technology (BST)','description':'Bio System Technology (BST)','teacher':'Hasintha Rajakaruna'},
    {'id':6,'name':'Biology 2021 (Theory/ Revision)','description':'Biology 2021 (Theory/ Revision)','teacher':'Kevin Sri'},
    {'id':7,'name':'Business Studies 2021 - Theory','description':'Business Studies 2021 - Theory','teacher':'Shama Perera'},
    {'id':8,'name':'Economics 2021 Theory /Revision','description':'Economics 2021 Theory /Revision','teacher':'Prasanna Galpatha'},
    {'id':9,'name':'Engineering Mathematics','description':'Engineering Maths 2022','teacher':'Amid Ashraf'},
    {'id':10,'name':'English Diploma Course - 2021 ','description':'English Diploma Course','teacher':'Sheril Shama'},
    {'id':11,'name':'ICT 2021 Theory/ Revision','description':'ICT 2021 Theory/Revision','teacher':'Nimal Godage'},
    {'id':12,'name':'Java/ Python Course','description':'Java/Python Course 2021','teacher':'Kelum Gamage'},
  ];
}
