import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Post } from '../../models/Post';
import { PostService } from '../../services/post.service';
import { ModalComponent } from '../start-post/modal/modal.component';

@Component({
  selector: 'app-all-posts',
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.scss'],
})
export class AllPostsComponent implements OnInit {

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  @Input() postBody?: string;

  queryParams: string;
  allLoadedPosts: Post[] = [];
  numberOfPosts = 5;
  skipPosts = 0;

  userId$ = new BehaviorSubject<number>(null);

  constructor(
      private postService: PostService, 
      private authService: AuthService,
      public modalController: ModalController
    ) { }

  ngOnInit() {
    this.getPosts(false, '');

    this.authService.userId.pipe(take(1)).subscribe((userId: number) => { // getting UserId at OnInit
      this.userId$.next(userId);
    })
  }

  // Post Body On changes
  ngOnChanges(changes: SimpleChanges){
    const postBody = changes.postBody.currentValue;
    if(!postBody) return;
    this.postService.createPost(postBody).subscribe((post: Post) => {
      this.allLoadedPosts.unshift(post);
    })
  }

  // Get the Post data
  getPosts(isInitialLoad: boolean, event){
    if(this.skipPosts === 20){
      event.target.disabled = true;
    }
    this.queryParams = `?take=${this.numberOfPosts}&skip=${this.skipPosts}`;
    this.postService.getSelectedPosts(this.queryParams).subscribe((posts: Post[]) =>{
      for(let post = 0; post < posts.length; post++){
        this.allLoadedPosts.push(posts[post])
      }
      if(isInitialLoad) event.target.complete(); // if there is no post, hide the loader
      this.skipPosts = this.skipPosts + 5;
    }, (error) => {
      console.error("lol",error);
    })
  }

  // Load Data
  loadData(event){
    this.getPosts(true, event);
  }

  // Open Update Modal
  async presentUpdateModal(postId: number){
    const modal = await this.modalController.create({
      component: ModalComponent,
      cssClass: 'my-custom-class2',
      componentProps:{
        postId,
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();

    if(!data) return;

    const NewPostBody = data.post.body;
    this.postService.updatPost(postId, this.postBody).subscribe(() => {
      const postIndex = this.allLoadedPosts.findIndex(
        (post: Post) => post.id == postId
      );
      this.allLoadedPosts[postIndex].body = NewPostBody;
    })
  }

  // Delete Post
  deletePost(postId: number){
    this.postService.deletePost(postId).subscribe(() => {
      alert("Post was deleted");
      this.allLoadedPosts = this.allLoadedPosts.filter((post: Post) => post.id !== postId);
    })
  }


}
