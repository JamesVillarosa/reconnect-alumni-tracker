import DesktopNavbar from "../../components/DesktopNavbar";
import { BackAndFontAndProfileHeader } from "../../components/MobileHeaders";
import UserNavbar from "../../components/UserNavbar";
import { CommentBox, PurifyHTMLText } from "../../components/RichTextEditor";
import { CommentCard, CommentReplyCard } from "../../components/CommentCard";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const storyCategories = new Map<string, string>([
  ['ICSFaculty', 'ICS FACULTY'],
  ['studentAchievements', 'STUDENT ACHIEVEMENTS'],
  ['collegeEvents', 'COLLEGE EVENTS']
]);

interface AuthorInfo {
  first_name: string;
  last_name: string;
  profile_picture?: string;
}

interface CommentProps {
  commentID: string,
  articleID: string,
  userID: string,
  content: string,
  datePosted: string,
  replies?: CommentProps[]
}

interface ArticleProps {
  id: string;
  title: string;
  content: string;
  created_at: string;
  imageURL?: string;
  category?: string;
}

const UserNewsDetailsPage: React.FC = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<ArticleProps | null>(null);
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [showAllComments, setShowAllComments] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const limit: number = 3;

  // Convert to useCallback to avoid recreating on every render
  const fetchComments = useCallback(async (articleId: string) => {
    try {
      setIsRefreshing(true);
      console.log(`Fetching comments for article: ${articleId}`);
      
      const commentRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/comments/thread/origin/${articleId}`, 
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }
      );
      
      console.log("Comments received:", commentRes.data);
      
      // Check if comments exist in the response
      if (commentRes.data && commentRes.data.comments && Array.isArray(commentRes.data.comments)) {
        const formattedComments = commentRes.data.comments.map((comment: any) => ({
          commentID: comment._id,
          articleID: comment.threadId || articleId, // Fallback to articleId if threadId is missing
          userID: comment.authorId || "unknown", // Fallback if authorId is missing
          content: comment.text || "", // Fallback if content is missing
          datePosted: comment.created_at || new Date().toISOString(), // Fallback to current time
          replies: comment.replies ? comment.replies.map((reply: any) => ({
            commentID: reply._id,
            articleID: reply.threadId || articleId,
            userID: reply.authorId || "unknown",
            content: reply.text || "",
            datePosted: reply.created_at || new Date().toISOString()
          })) : []
        }));
        
        setComments(formattedComments);
      } else {
        console.warn("No comments found or invalid comment structure:", commentRes.data);
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/articles/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        });
        console.log("Article Response:", response.data);
        
        setArticle({
          id: response.data._id,
          title: response.data.title,
          content: response.data.description,
          created_at: response.data.created_at,
          imageURL: response.data.imageURL,
          category: response.data.category
        });
        
        // Fetch comments after article is loaded
        await fetchComments(response.data._id);
        
      } catch (error) {
        console.error('Error fetching article:', error);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id, fetchComments]);

  const handleCommentPosted = () => {
    console.log("Comment posted, refreshing comments...");
    if (article) {
      fetchComments(article.id);
    } else if (id) {
      fetchComments(id);
    }
  };

  const visibleComments = showAllComments ? comments : comments.slice(0, limit);

  const handleViewAllCommentsToggle = () => {
    setShowAllComments(!showAllComments);
  };

  if (!article) {
    return <div>Loading...</div>;
  }

  return (
    <>  
      <UserNavbar activePage='Home'/>
      <DesktopNavbar activePage='Home'/>
      <BackAndFontAndProfileHeader />

      <div className="flex justify-center items-center overflow-hidden">
        {/* limit the page to 1280px */}
        <div className="max-w-[1280px] w-full flex flex-col justify-center items-center my-10 lg:my-15">
          <div className="w-9/10 md:w-4/5 flex flex-col items-center pb-20 lg:pb-30">
            {/* main article */}
            <div className="w-full flex flex-col gap-5 items-center">
              {/* article information */}
              <h2 className="text-lg text-DarkerPrimary font-medium">
                {article.category ? storyCategories.get(article.category) : 'NEWS'}
              </h2>
              <h1 className="text-4xl text-DarkerPrimary font-bold sm:max-w-3/4 lg:max-w-2/3 text-center">{article.title}</h1>
              <h2 className="text-lg text-DarkerPrimary font-medium">
                {new Date(article.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }).toUpperCase()}
              </h2>

              {/* article image */}
              <div className={`w-full rounded-3xl overflow-hidden mt-2 mb-3 md:mb-6 relative ${article.imageURL ? '' : 'hidden'}`}>
                <img src={article.imageURL} className="w-full h-full object-cover" alt={article.title} />
                <BlueImageOverlay />
              </div>

              {/* article content */}
              <h3 className="text-DarkerPrimary font-medium prose leading-[1.3] sm:max-w-9/10 md:max-w-5/6">
                <PurifyHTMLText content={article.content} />
              </h3>
            </div>
          </div>

          {/* comment section */}
          <div className="w-4/5 flex flex-col pb-20">
            <h1 className="text-xl sm:text-2xl lg:text-3xl text-DarkerPrimary font-semibold">Comments</h1>
            <br />
            {/* Comment box with properly connected onCommentPosted callback */}
            <CommentBox 
              articleId={article.id || id || ''} 
              onCommentPosted={handleCommentPosted} 
            />
            <br />
            
            {/* Loading state */}
            {isRefreshing && (
              <div className="w-full py-4 text-center text-gray-500">
                Loading comments...
              </div>
            )}
            
            {/* comments container */}
            <div className="flex flex-col gap-2 mb-15">
              {visibleComments.length > 0 ? (
                visibleComments.map((comment) => (
                  <div key={comment.commentID}>
                    <CommentCard 
                      articleID={comment.articleID} 
                      commentID={comment.commentID} 
                      userID={comment.userID} 
                      content={comment.content} 
                      datePosted={comment.datePosted} 
                    />
                    {/* Render replies if any */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="flex flex-col">
                        {comment.replies.map((reply) => (
                          <CommentReplyCard 
                            key={reply.commentID} 
                            articleID={reply.articleID} 
                            commentID={reply.commentID} 
                            userID={reply.userID} 
                            content={reply.content} 
                            datePosted={reply.datePosted} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                !isRefreshing && (
                  <div className="w-full py-8 text-center text-gray-500">
                    No comments yet. Be the first to comment!
                  </div>
                )
              )}
            </div>
            
            {/* Show view more/less button only if there are enough comments */}
            {comments.length > limit && (
              <button 
                className="bg-Gradient2 text-white text-sm md:text-lg font-semibold hover:bg-Gradient1 hover:brightness-110 py-2 px-4 lg:py-4 lg:px-6 rounded-lg"
                onClick={handleViewAllCommentsToggle}
              >
                {showAllComments ? 'View Less Comments' : 'View All Comments'}
              </button>
            )}
          </div>

          {/* space for aesthetic */}
          <div className="h-10 md:h-20 lg:h-30 w-full" />
        </div>
      </div> 
    </>
  );
};

/**
 * A transparent blue linear gradient overlay to be placed on
 * top of images in the News and Articles Page for color harmony.
 */
const BlueImageOverlay: React.FC = () => {
  return (
    <div className="h-full w-full absolute top-0 bg-linear-to-b from-transparent to-[#00ACED] opacity-40"></div>
  );
};

export default UserNewsDetailsPage;