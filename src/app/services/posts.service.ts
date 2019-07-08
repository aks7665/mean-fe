import { Injectable } from '@angular/core';
import { Post } from '../models/post.model';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] =[];

  private _posts = new Subject<Post[]>();
  private _post = new Subject<Post>();

  constructor(private http: HttpClient, private router: Router) { }

  getPosts() {
    // return [...this.posts];
    const url = environment.apiUrl + 'api/posts';
    this.http.get<{message: string, posts: any}>(url)
    .pipe(map((postData) => {
      let posts = [...postData.posts];
      posts = posts.map((post) => {
        return {
          _id: post._id,
          title: post.title,
          content: post.content,
          date: post.createdAt
        };
      });
      return {
        message: postData.message,
        posts
      };
    }))
    .subscribe((postData) => {
      this.posts = postData.posts;
      this._posts.next([...this.posts]);
      console.log(this.posts)
    });
  }

  getPost(id: string) {
    const post = {...this.posts.find(p => p.title === id)};
    if (post.hasOwnProperty('title')) {
      this._post.next(post);
    } else {
      const url = environment.apiUrl + 'api/posts/' + id;
      this.http.get<{message: string, post: Post}>(url)
      .subscribe((response) => {
        console.log(response);
        this._post.next(response.post);
      });
    }
  }

  getPostsListener() {
    return this._posts.asObservable();
  }

  getPostListener() {
    return this._post.asObservable();
  }

  addPost(title: string, content: string) {
    const post: Post = {
      title,
      content
    };
    const url = environment.apiUrl + 'api/posts';
    this.http.post<{post: any, message: string}>(url, post)
    .subscribe((response) => {
      const tempPost = response.post;
      tempPost.date = response.post.createdAt;
      delete tempPost.createdAt;
      this.posts.push(tempPost);
      this._posts.next([...this.posts]);

      this.router.navigate(['/']);
    });
  }

  updatePost(id: string, title: string, content: string) {
    const post: Post = {
      title,
      content
    };
    const url = environment.apiUrl + 'api/posts/' + id;
    this.http.put<{message: string, post: any}>(url, post)
    .subscribe((postData) => {
      const tempPost = postData.post;
      tempPost.date = postData.post.createdAt;
      delete tempPost.createdAt;

      const tempPosts = [...this.posts];
      const oldPostIndex = tempPosts.findIndex(p => p._id === id);
      tempPosts[oldPostIndex] = tempPost;
      this.posts = tempPosts;
      this._posts.next([...this.posts]);

      this.router.navigate(['/']);
    });
  }

  deletePost(postId: string) {
    if (!postId) {
      console.log('Id doesn\'t exists on post.');
      return;
    }
    console.log(postId + 'delete');
    const url = environment.apiUrl + 'api/posts/' + postId;
    this.http.delete<{message: string}>(url)
    .subscribe((response) => {
      const updatedPost = this.posts.filter((post) => post._id !== postId);
      this.posts = updatedPost;
      this._posts.next([...this.posts]);
    });
  }
}
