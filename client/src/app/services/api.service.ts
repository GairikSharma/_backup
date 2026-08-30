import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Contribution {
  name: string;
  email: string;
  contributedAmount: number;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly baseUrl =
    'https://proyash-backup-data1.onrender.com/api';

  constructor(private http: HttpClient) {}

  createContribution(
    contribution: Contribution
  ): Observable<any> {

    return this.http.post(
      `${this.baseUrl}/save`,
      contribution
    );
  }
}
