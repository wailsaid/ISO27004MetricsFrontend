import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {

  username : string ="user";

  ngOnInit(): void {
    //this.username =
    var obj = localStorage.getItem('user');
    if (obj) {
     this.username =  JSON.parse(obj).username;
    }
  }



}
