import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-f-teachers',
  templateUrl: './f-teachers.component.html',
  styleUrls: ['./f-teachers.component.css']
})
export class FTeachersComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  teachers= [
    {'id':1,'fname':'KEVIN','lname':'SRI','subject':'Bio-Science','img':'../../assets/teachers/Kevin perera.jpg'},
    {'id':2,'fname':'MICHELLE','lname':'ANNE','subject':'Accounting','img':'../../assets/teachers/Christina.jpg'},
    {'id':3,'fname':'MALIK','lname':'DOE','subject':'Pure-Maths','img':'../../assets/teachers/m-brauer-yEYmnaFuYVM-unsplash.jpg'},
    {'id':4,'fname':'JAKSON','lname':'SILVA','subject':'Physics','img':'../../assets/teachers/vince-fleming-_THUISs23CI-unsplash.jpg'},
    {'id':5,'fname':'SHAMA','lname':'PEIRIS','subject':'Business-Studies','img':'../../assets/teachers/shama silva.jpg'},
    {'id':6,'fname':'SARA','lname':'PERERA','subject':'Chemistry','img':'../../assets/teachers/stephanie sara.jpg'},
    {'id':7,'fname':'NIMAL','lname':'SILVA','subject':'Applied-Maths','img':'../../assets/teachers/portrait-caucasian-content-teacher-with-folded-hands.jpg'},
    {'id':8,'fname':'THARA','lname':'','subject':'ICT','img':'../../assets/teachers/happy-businesswoman.jpg'},
    {'id':9,'fname':'KELUM','lname':'PERERA','subject':'Sinhala','img':'../../assets/teachers/content-successful-male-manager-using-tablet-looking-camera.png'}

  ];
}
