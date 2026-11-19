type CommentProps = {
    _id: string;
    created_at: Date;
    updated_at: Date;
    text: string;
    authorId: string;           // ID of the user who wrote the comment
    threadId: string;           // ID of the parent thread (e.g. post/event)
    parent_comment_id?: string; // ID of the comment being replied to (undefined if top-level)
  };
  
  export default CommentProps;
  