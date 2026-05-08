import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OpenLibraryService {

  private baseUrl = 'https://openlibrary.org';

  constructor(private http: HttpClient) {}

  buscarLibros(query: string, limit = 20): Observable<any> {
    const q = encodeURIComponent(query || 'popular');
    return this.http.get(`${this.baseUrl}/search.json?q=${q}&limit=${limit}`);
  }

  obtenerDetalle(workId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/works/${workId}.json`);
  }

  obtenerPortada(coverId: number, size: 'S' | 'M' | 'L' = 'M'): string {
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
  }

  obtenerPortadaPorISBN(isbn: string, size: 'S' | 'M' | 'L' = 'M'): string {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
  }
}
