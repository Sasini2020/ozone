import { Component, OnInit } from '@angular/core';
import { faCoffee, faLaptop,faUsers,faUserGraduate,faTrophy} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  faCoffee = faCoffee;
  faLaptop = faLaptop;
  faUsers = faUsers;
  faUserGraduate = faUserGraduate;
  faTrophy = faTrophy;

}
