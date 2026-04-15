export type Post = {
  _id: string;
  userId: { _id: string; name: string; agencyName?: string };
  category: 'notice' | 'jobs' | 'info' | 'free';
  title: string;
  content: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PostsResponse = {
  posts: Post[];
  total: number;
  page: number;
};
