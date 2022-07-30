import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Post } from '../models/Post';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private http: HttpClient) { }

  // Http Header
  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  // Fetch posts
  getSelectedPosts(params){
    return this.http.get<Post[]>(`${environment.baseApiUrl}/feed${params}`)
    .pipe(
      tap((posts: Post[]) => {
        if (posts.length === 0) throw new Error('No posts to retrieve');
      })
    );
  }

  // Create Post
  createPost(body: string){
    return this.http.post<Post>(`${environment.baseApiUrl}/feed`, { body }, this.httpOptions)
    .pipe(take(1));
  }

  // Update Post
  updatPost(postId: number, body: string){
    return this.http.put<Post>(`${environment.baseApiUrl}/feed/${postId}`, {body}, this.httpOptions)
    .pipe(take(1));
  }

  // Delete Post
  deletePost(postId: number){
    return this.http.delete(`${environment.baseApiUrl}/feed/${postId}`)
    .pipe(take(1));
  }
}
