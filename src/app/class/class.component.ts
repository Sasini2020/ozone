import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.css']
})
export class ClassComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  class= [
    {'id':1,'name':'Combined Maths','description':'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis earum eiu','image':'../../assets/combinedmaths.jpg'},
    {'id':2,'name':'Chemistry','description':'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis earum eiu','image':'../../assets/combinedmaths.jpg'},
    {'id':3,'name':'Physics','description':'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis earum eiu','image':'../../assets/combinedmaths.jpg'},
    {'id':4,'name':'Biology','description':'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis earum eiu','image':'../../assets/combinedmaths.jpg'}
    // {'id':1,'name':'Combined Mathematics','description':'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis earum eiu','image':'../../assests/combinedmaths.jpg'},
  ]
}
