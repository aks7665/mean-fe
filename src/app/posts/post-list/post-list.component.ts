import { Component, OnInit } from '@angular/core';
import { Post } from 'src/app/models/post.model';
import { PostsService } from 'src/app/services/posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {

  posts: Post[] = [];
  isLoading = true;

  constructor(public postsService: PostsService) { }

  ngOnInit() {
    this.postsService.getPosts();
    this.postsService.getPostsListener().subscribe((posts: Post[]) => {
      this.posts = posts;
      this.isLoading = false;
    })
  }

  onDelete(postId: string) {
    console.log(postId);
    this.postsService.deletePost(postId);
  }
}
