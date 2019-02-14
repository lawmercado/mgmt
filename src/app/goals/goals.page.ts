import { Component, OnInit } from '@angular/core';
import { GoalData } from 'src/services/database.service';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
})
export class GoalsPage implements OnInit {

  public goals: GoalData[];

  constructor() {
    this.goals = [];
  }

  ngOnInit() {
  }

}
