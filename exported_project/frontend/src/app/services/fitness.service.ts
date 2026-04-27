import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FitnessService {
  private apiUrl = 'http://localhost:8080/api/fitness';

  constructor(private http: HttpClient) { }

  getSummary(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.get(`${this.apiUrl}/summary`, { headers });
  }

  syncData(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.post(`${this.apiUrl}/sync`, {}, { headers });
  }
}
