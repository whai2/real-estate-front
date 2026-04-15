export type Comment = {
  _id: string;
  postId: string;
  userId: { _id: string; name: string; agencyName?: string };
  content: string;
  createdAt: string;
};
