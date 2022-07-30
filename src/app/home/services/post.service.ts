import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Post } from '../models/Post';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private http: HttpClient) { }

  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  getSelectedPosts(params){
    return this.http.get<Post[]>(`${environment.baseApiUrl}/feed${params}`)
    .pipe(
      tap((posts: Post[]) => {
        if (posts.length === 0) throw new Error('No posts to retrieve');
      })
    );
  }
}
