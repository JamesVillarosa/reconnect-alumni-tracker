type ArticleProps = {
    _id: string;
    created_at: Date;
    updated_at: Date;
    authorId: string;
    title: string;
    description: string;
    imageURL?: string;
    commentId: string;
};

export default ArticleProps;