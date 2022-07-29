import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
// import { Plugins } from '@capacitor/core';
// import { Storage } from '@capacitor/core/dist/'; // <--- Store in Local Storage
import jwt_decode from 'jwt-decode'; // <--- JWT Decode
import { switchMap, take, tap } from 'rxjs/operators'; // <--- take, tap
import { environment } from 'src/environments/environment';
import { NewUser } from '../models/newUser.model';
import { Role, User } from '../models/user.model';
import { UserResponse } from '../models/userResponse.model';
import jwtDecode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private user$ = new BehaviorSubject<User>(null);

  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
  }

  

  // to check user is loggedin or not
  get isUserLoggedIn(): Observable<boolean>{
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        const isUserAuthenticated = user !== null;
        return of(isUserAuthenticated);
      })
    )
  };

  // to check user role
  get userRole(): Observable<Role>{
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        return of(user.role);
      })
    )
  }

  constructor(private http: HttpClient, private router:Router) { }

  // New User Register
  register(newUser: NewUser): Observable<User> {
    return this.http.post<User>(
      `${environment.baseApiUrl}/auth/register`, newUser, this.httpOptions
    ).pipe(take(1));
  }; 

  // User Login
  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${environment.baseApiUrl}/auth/login`, {email, password}, this.httpOptions
    ).pipe(take(1),
    tap((response: { token: string}) => {
      // Plugins.Storage.set({
      //   key: 'token',
      //   value: response.token
      // });
      localStorage.setItem('token', response.token);
      const decodedToken: UserResponse = jwt_decode(response.token);
      this.user$.next(decodedToken.user);
    })); 
  };

  // User logout
  logout(): void{
    this.user$.next(null);
    console.log(this.user$);
    localStorage.removeItem('token');
    this.router.navigateByUrl("/auth");
  }

}
