import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';


@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {

  userFullImagePath: string;
  private userImagePathSubscription: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    // Getting User Image
    this.userImagePathSubscription = this.authService.userFullImagePath.subscribe((fullImagePath: string) => {
      this.userFullImagePath = fullImagePath;
    })
  }

  onSignOut(){
    this.authService.logout();
  }

  ngOnDestroy() {
    this.userImagePathSubscription.unsubscribe();
  }

}
