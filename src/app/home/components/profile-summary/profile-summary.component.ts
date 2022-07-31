import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, from, of, Subscription } from 'rxjs';
// import { fileTypeFromBuffer } from 'file-type';
// import { FileTypeResult } from 'file-type';
import { switchMap, take } from 'rxjs/operators';
import { Role } from 'src/app/auth/models/user.model';
import { AuthService } from 'src/app/auth/services/auth.service';

type validFileExtension = 'png' | 'jpg' | 'jpeg'
type validMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';


type BannerColors = {
  colorOne: string;
  colorTwo: string;
  colorThree: string;
}

@Component({
  selector: 'app-profile-summary',
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.scss'],
})
export class ProfileSummaryComponent implements OnInit, OnDestroy {

  form: FormGroup;

  // valid file extensions
  validFileExtensions: validFileExtension[] = ['png' , 'jpg' , 'jpeg'];
  valieMimeTypes : validMimeType[] = ['image/png', 'image/jpg', 'image/jpeg'];

  userFullImagePath: string;
  private userImagePathSubscription: Subscription;

  fullName$ = new BehaviorSubject<string>(null);
  fullName = '';

  // Banner Colors
  bannerColors: BannerColors = {
    colorOne: '#a0b4b7',
    colorTwo: '#dbe7e9',
    colorThree: '#bfd3d6',
  }

  constructor(private authService: AuthService) { }

  ngOnInit() {

    // for image input
    this.form = new FormGroup({
      file: new FormControl(null)
    });

    // Getting User role
    this.authService.userRole.pipe(take(1)).subscribe((role : Role) => {
      this.bannerColors = this.getBannerColors(role);
    });

    // Getting User FullName
    this.authService.userFullName.pipe(take(1)).subscribe((fullName: string) => {
      this.fullName = fullName;
      this.fullName$.next(fullName);
    })

    // Getting User Image
    this.userImagePathSubscription = this.authService.userFullImagePath.subscribe((fullImagePath: string) => {
      this.userFullImagePath = fullImagePath;
    })
  }

  // Banner COlor according to the role
  private getBannerColors(role: Role): BannerColors{
    switch (role) {
      case 'admin':
        return{
          colorOne: '#daa520',
          colorTwo: '#f0e68c',
          colorThree: '#fafad2',
        }
      
        case 'premium': 
        return{
          colorOne: '#bc8f8f',
          colorTwo: '#c09999',
          colorThree: '#ddadaf',
        }
    
      default:
        return this.bannerColors;
    }
  }

  // File select (image)
  onSelectFile(event: Event): void{
    const file: File = (event.target as HTMLInputElement).files[0];
    if(!file) return;

    const formData = new FormData();
    formData.append('file', file);
    // from(file.arrayBuffer())
    // .pipe(
    //   switchMap((buffer: Buffer) => {
    //     return from(fromBuffer(buffer)).pipe(
    //       switchMap((fileTypeResult: FileTypeResult) => {
    //         if(!fileTypeResult){
    //           console.error({ error: 'File Format not supported!'});
    //           return of();
    //         }
    //         const { ext, mime } = fileTypeResult;

    //         const isFileTypeLegit = this.validFileExtensions.includes(
    //           ext as any
    //         );

    //         const isMimTypeLegit = this.valieMimeTypes.includes(
    //           mime as any
    //         );

    //         const isFileLegit = isFileTypeLegit && isMimTypeLegit;

    //         if(!isFileLegit){
    //           console.log({
    //             error: "File Format does not match File extension!",
    //           });
    //           return of();
    //         }
    //         return this.authService.uploadUserImage(formData);
    //       })
    //     );
    //   })
    // )
    // .subscribe();

    // this.form.reset();
  }

  ngOnDestroy() {
    this.userImagePathSubscription.unsubscribe();
  }

}
