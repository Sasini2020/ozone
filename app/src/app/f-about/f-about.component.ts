import { Component, OnInit } from '@angular/core';
//import { faCheck, faCaretRight, faAngleRight, faBookReader, faChalkboardTeacher, faSchool, faAward} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-f-about',
  templateUrl: './f-about.component.html',
  styleUrls: ['./f-about.component.css']
})
export class FAboutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
/*
  faCheck = faCheck;
  faCaretRight = faCaretRight;
  faAngleRight = faAngleRight;
  faBookReader = faBookReader;
  faChalkboardTeacher = faChalkboardTeacher;
  faSchool = faSchool;
  faAward = faAward;*/


  teachers= [
    {'id':1,'fname':'KEVIN','lname':'SRI','subject':'Bio-Science','img':'../../assets/teachers/Kevin perera.jpg'},
    {'id':2,'fname':'MICHELLE','lname':'ANNE','subject':'Accounting','img':'../../assets/teachers/Christina.jpg'},
    {'id':3,'fname':'MALIK','lname':'DOE','subject':'Pure-Maths','img':'../../assets/teachers/m-brauer-yEYmnaFuYVM-unsplash.jpg'},
    {'id':4,'fname':'JAKSON','lname':'SILVA','subject':'Physics','img':'../../assets/teachers/vince-fleming-_THUISs23CI-unsplash.jpg'},
    {'id':5,'fname':'SHAMA','lname':'PEIRIS','subject':'Business-Studies','img':'../../assets/teachers/shama silva.jpg'},
    {'id':6,'fname':'SARA','lname':'PERERA','subject':'Chemistry','img':'../../assets/teachers/stephanie sara.jpg'},
   
  ];

}
