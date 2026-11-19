type CommentThreadProps = {
    _id: string;
    created_at: Date;
    updated_at: Date;
    commentId_list: string[];
    originId: string;
};

export default CommentThreadProps;