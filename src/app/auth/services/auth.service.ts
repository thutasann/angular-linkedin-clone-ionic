import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { Storage } from '@capacitor/storage';
// import { Plugins } from '@capacitor/core';
// import { Storage } from '@capacitor/core/dist/'; // <--- Store in Local Storage
import jwt_decode from 'jwt-decode'; // <--- JWT Decode
import { map, switchMap, take, tap } from 'rxjs/operators'; // <--- take, tap
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
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  // For image upload
  get userStream(): Observable<User>{
    return this.user$.asObservable();
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

  // to check user id
  get userId(): Observable<number>{
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        return of(user.id);
      })
    )
  };

  // To get user fullName
  get userFullName(): Observable<string>{
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        const fullName = user.firstName + ' ' + user.lastName;
        return of(fullName);
      })
    )
  }

  get userFullImagePath(): Observable<string>{
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        const doesUserHaveImage = !!user?.imagePath;
        let fullImagePath = this.getDefaultFullImagePath();
        if(doesUserHaveImage){
          fullImagePath = this.getFullImagePath(user.imagePath);
        }
        return of(fullImagePath);
      })
    )
  }

  
  constructor(private http: HttpClient, private router:Router) { }

  // To get Default Image path
  getDefaultFullImagePath(): string{
    return 'http://localhost:3000/api/feed/image/blank-profile-picture.png';
  }

  // To get Full Image path
  getFullImagePath(imageName: string): string{
    return 'http://localhost:3000/api/feed/image/'+imageName;
  }

  // Get User Image
  getUserImage(){
    return this.http.get(`${environment.baseApiUrl}/user/image`).pipe(take(1));
  }

  // Get User Image Name
  getUserImageName(): Observable<{imageName: string}>{
    return this.http.get<{imageName: string}>(`${environment.baseApiUrl}/user/image-name`).pipe(take(1));
  }

  // Update User Image Path
  updateUserImagePath(imagePath: string): Observable<User>{
    return this.user$.pipe(
      take(1),
      map((user: User) => {
        user.imagePath = imagePath;
        this.user$.next(user);
        return user;
      })
    )
  };

  // Upload User Image
  uploadUserImage(formData: FormData): Observable<{ modifiedFileName: string }>{
    return this.http.post<{ modifiedFileName: string}>(
      `${environment.baseApiUrl}/user/upload`, formData
    ).pipe(
      tap(({ modifiedFileName }) =>{
        let user = this.user$.value;
        user.imagePath = modifiedFileName;
        this.user$.next(user);
      })
    )
  }

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
      Storage.set({
        key: 'token',
        value: response.token
      });
      const decodedToken: UserResponse = jwt_decode(response.token);
      this.user$.next(decodedToken.user);
    })); 
  };

  // to check token in storage
  isTokenInStorage(): Observable<boolean> {
    return from(
      Storage.get({
        key: 'token',
      })
    ).pipe(
      map((data: { value: string }) => {
        if (!data || !data.value) return null;

        const decodedToken: UserResponse = jwt_decode(data.value);
        const jwtExpirationInMsSinceUnixEpoch = decodedToken.exp * 1000;
        const isExpired =
          new Date() > new Date(jwtExpirationInMsSinceUnixEpoch);

        if (isExpired) return null;
        if (decodedToken.user) {
          this.user$.next(decodedToken.user);
          return true;
        }
      })
    );
  }
  

  // User logout
  logout(): void{
    this.user$.next(null);
    console.log(this.user$);
    Storage.remove({
      key: 'token'
    });
    this.router.navigateByUrl("/auth");
  }

}
