import { Component, OnInit } from '@angular/core';
import { FitnessService } from './services/fitness.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="dashboard-container">
      <header>
        <h1>FitEdge Dashboard</h1>
        <button (click)="sync()">Sync Now</button>
      </header>
      <div class="metrics-grid">
        <metric-card title="Steps" [value]="summary.steps"></metric-card>
        <metric-card title="Calories" [value]="summary.calories"></metric-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 2rem; background: #09090b; color: white; min-height: 100vh; }
  `]
})
export class AppComponent implements OnInit {
  summary: any = { steps: 0, calories: 0 };

  constructor(private fitnessService: FitnessService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.fitnessService.getSummary().subscribe(data => this.summary = data);
  }

  sync() {
    this.fitnessService.syncData().subscribe(() => this.loadData());
  }
}
