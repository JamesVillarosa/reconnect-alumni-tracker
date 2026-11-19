import ProfilePic from '../assets/placeholders/pfp_placeholder.avif';
import { CommentBox, PurifyHTMLText } from './RichTextEditor';
import { formatToHoursOrDate } from '../pages/utils/TimeFormat.ts';
import { useState } from 'react';

/**
 * A card for comments in the News Details page.
 * @param {string} commentID - the ID of the comment
 * @param {string} articleID - the ID of the article
 * @param {string} userID - the ID of the user who made the comment, used to get username and profile picture
 * @param {string} content - the content of the comment, in HTML text format
 * @param {string} datePosted - the date (isoDate) when the comment was posted
 */
export const CommentCard: React.FC<{
    commentID: string;
    articleID: string;
    userID: string;
    content: string;
    datePosted?: string; // Make datePosted optional
}> = ({
    commentID,
    articleID,
    userID,
    content,
    datePosted = '' // Provide default empty string
}) => {
    const id: string = commentID;
    const user_id: string = userID;
    const username: string = `Arianna Domingo`; // derived from userID
    const profilePicture: string = ProfilePic; // derived from userID
    const commentContent: string = content;

    // fix for ES lint errors
    // remove after integration
    console.log(id);
    console.log(user_id);

    // console.log("DATE POSTED: ", datePosted);
    // console.log("ARTICLE ID: ", articleID);
    // console.log("COMMENT ID: ", commentID);
    // console.log("USER ID: ", userID);
    // console.log("COMMENT CONTENT: ", commentContent);
    

    // toggle for controlling reply comment box visibility
    const [isReplyBoxVisible, setIsReplyBoxVisible] = useState<boolean>(false);

    const handleReplyBoxVisibility = () => {
        if (isReplyBoxVisible) {
            setIsReplyBoxVisible(false);
        } else {
            setIsReplyBoxVisible(true);
        }
    }

    return (
        <div className="w-full flex flex-col gap-5 py-5">
            {/* user display */}
            <div className="flex gap-3 items-center">
                <img src={profilePicture} className="rounded-full h-12 lg:h-14" alt={`${username}'s profile`} />
                <h2 className="text-lg lg:text-xl text-Primary font-semibold">{username}</h2>
            </div>

            {/* comment content */}
            <h2 className="text-sm md:text-base text-Primary">
                <PurifyHTMLText content={commentContent} />
            </h2>

            {/* reply button and date posted */}
            <div className="flex gap-5 items-center">
                <button className="bg-Secondary text-white text-sm md:text-base font-medium hover:brightness-110 py-1 px-6 rounded-sm"
                    onClick={handleReplyBoxVisibility}
                >
                    {isReplyBoxVisible ? 'Hide Reply' : 'Reply'}
                </button>
                <h2 className="text-sm md:text-base text-Primary font-semibold">
                    {formatToHoursOrDate(datePosted)}
                </h2>
            </div>

            <div className={isReplyBoxVisible ? 'ml-5' : 'hidden'}>
                <CommentBox articleId={articleID} parentCommentID={commentID} isReply={true} />
            </div>
        </div>
    );
};


/**
 * A card for replies to comments in the News Details page.
 * @param {string} commentID - the ID of the comment
 * @param {string} articleID - the ID of the article
 * @param {string} userID - the ID of the user who made the comment, used to get username and profile picture
 * @param {string} content - the content of the comment, in HTML text format
 * @param {string} datePosted - the date (isoDate) when the comment was posted
 */
export const CommentReplyCard: React.FC<{
    commentID: string;
    articleID: string;
    userID: string;
    content: string;
    datePosted?: string; // Make datePosted optional
}> = ({
    commentID,
    articleID,
    userID,
    content,
    datePosted = '' // Provide default empty string
}) => {
    const id: string = commentID;
    const user_id: string = userID;
    const username: string = `Arianna Domingo`; // derived from userID
    const profilePicture: string = ProfilePic; // derived from userID
    const commentContent: string = content;

    // fix for ES lint errors
    // remove after integration
    console.log(id);
    console.log(user_id);
    console.log(articleID);

    return (
        <div className="w-4/5 flex flex-col gap-3 ml-5 border-l-3 border-l-[#97A9BE] p-5">
            {/* user display */}
            <div className="flex gap-3 items-center">
                <img src={profilePicture} className="rounded-full h-10 lg:h-12" alt={`${username}'s profile`} />
                <h2 className="text-base lg:text-lg text-Primary font-semibold">{username}</h2>
            </div>

            {/* comment content */}
            <h2 className="text-xs lg:text-sm text-Primary">
                <PurifyHTMLText content={commentContent} />
            </h2>

            {/* date posted */}
            <h2 className="text-xs lg:text-sm text-Primary font-semibold">
                {formatToHoursOrDate(datePosted)}
            </h2>
        </div>
    );
};