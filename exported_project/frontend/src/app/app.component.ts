import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FitnessService } from './services/fitness.service';
import { Chart, registerables } from 'chart.js';
import { LucideAngularModule, Zap, Footprints, Flame, Heart, Construction, ChevronRight, Activity, Clock, Moon, Save, Settings, User as UserIcon, ArrowUpRight } from 'lucide-angular';

Chart.register(...registerables);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('sleepChart') sleepChartCanvas!: ElementRef;
  
  readonly icons = { 
    Zap, Footprints, Flame, Heart, Construction, 
    ChevronRight, Activity, Clock, Moon, Save, Settings, UserIcon, ArrowUpRight 
  };

  summary: any = { steps: 0, calories: 0, heartRate: 0, lastSleep: 0, sleepHistory: [], weight: 0, height: 0 };
  heartRateStream: any[] = [];
  recommendations: any[] = [];
  allUsers: any[] = [];
  currentView: string = 'dashboard';
  user: any = { name: '', email: '' };
  private chart: any;

  constructor(private fitnessService: FitnessService) {}

  ngOnInit() {
    this.loadData();
    this.listenToUpdates();
    this.loadRecommendations();
  }

  ngAfterViewInit() {
    // Chart will be initialized when data arrives
  }

  loadData() {
    this.fitnessService.getSummary().subscribe({
      next: (data) => {
        if (data) {
          this.summary = { ...this.summary, ...data };
          this.user = { name: data.name, email: data.email };
          this.initChart();
          this.loadRecommendations();
        }
      },
      error: (err) => console.log('Session inactive or not logged in')
    });
    
    this.fitnessService.getGoogleFitData().subscribe({
      next: (data) => {
        if (data) {
          this.summary = { ...this.summary, ...data };
          this.user = { name: data.name, email: data.email };
          this.initChart();
          this.loadRecommendations();
        }
      },
      error: (err) => console.log('Google Fit connection required')
    });
  }

  loadRecommendations() {
    this.fitnessService.getRecommendations().subscribe(data => {
      this.recommendations = data;
    });
    this.fitnessService.getUsers().subscribe(data => {
      this.allUsers = data;
    });
  }

  savePhysicalData() {
    this.fitnessService.updatePhysicalData(this.summary.weight, this.summary.height).subscribe(() => {
      console.log('Physical data saved');
      this.loadRecommendations();
    });
  }

  initChart() {
    if (!this.sleepChartCanvas || !this.summary.sleepHistory.length) return;
    
    if (this.chart) this.chart.destroy();

    const history = [...this.summary.sleepHistory].reverse();
    const ctx = this.sleepChartCanvas.nativeElement.getContext('2d');
    
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: history.map((s: any) => new Date(s.date).toLocaleDateString(undefined, { weekday: 'short' })),
        datasets: [{
          label: 'Sleep Hours',
          data: history.map((s: any) => s.hours),
          backgroundColor: '#8b5cf6',
          borderRadius: 8,
          barThickness: 12
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { display: false, beginAtZero: true },
          x: { grid: { display: false }, border: { display: false }, ticks: { color: '#71717a' } }
        }
      }
    });
  }

  connectGoogleFit() {
    window.location.href = this.fitnessService.getLoginUrl();
  }

  listenToUpdates() {
    this.fitnessService.updates$.subscribe(update => {
      if (update) {
        this.summary.heartRate = update.heartRate;
        this.summary.steps += update.steps;
        this.summary.calories += update.calories;

        const now = new Date().toLocaleTimeString();
        this.heartRateStream.push({ time: now, value: update.heartRate });
        if (this.heartRateStream.length > 30) this.heartRateStream.shift();
      }
    });
  }

  setView(view: string) {
    this.currentView = view;
  }
}
