import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = `${environment.apiBaseUrl}/document/upload`;  // Use the base URL from environment

  constructor(private http: HttpClient) {}

  uploadDocument(userId: number, file: File, documentType: string): Observable<any> {
    const formData = new FormData();
    formData.append('userId', userId.toString());
    formData.append('file', file);
    formData.append('documentType', documentType);

    return this.http.post(this.apiUrl, formData, {
      headers: new HttpHeaders(),
    });
  }
}
