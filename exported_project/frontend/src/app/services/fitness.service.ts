import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class FitnessService {
  private apiUrl = 'http://localhost:8080/api';
  private socketUrl = 'http://localhost:8080/ws-fitness';
  private stompClient: any;
  
  private realTimeUpdates = new BehaviorSubject<any>(null);
  public updates$ = this.realTimeUpdates.asObservable();

  constructor(private http: HttpClient) {
    this.initWebSocket();
  }

  private initWebSocket() {
    const socket = new SockJS(this.socketUrl);
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = null;
    
    this.stompClient.connect({}, (frame: any) => {
      this.stompClient.subscribe('/topic/fitness', (message: any) => {
        if (message.body) {
          this.realTimeUpdates.next(JSON.parse(message.body));
        }
      });
    });
  }

  getSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fitness/summary`);
  }

  getGoogleFitData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fitness/data`);
  }

  updatePhysicalData(weight: number, height: number, email?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/fitness/physical`, { weight, height, email });
  }

  getRecommendations(email?: string): Observable<any[]> {
    const url = email ? `${this.apiUrl}/fitness/recommendations?email=${email}` : `${this.apiUrl}/fitness/recommendations`;
    return this.http.get<any[]>(url);
  }

  getLoginUrl(): string {
    return 'http://localhost:8080/oauth2/authorization/google';
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/fitness/users`);
  }

  getGoals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/goals`);
  }

  syncData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync`, {});
  }
}
