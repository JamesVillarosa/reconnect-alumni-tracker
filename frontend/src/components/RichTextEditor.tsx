import { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import ProfilePic from '../assets/placeholders/pfp_placeholder.avif';
import { Bold, Italic, Link as LinkIcon } from "lucide-react";
import { useEditor, EditorContent } from '@tiptap/react';
import Link from '@tiptap/extension-link';
import StarterKit from '@tiptap/starter-kit';
import DOMPurify from 'dompurify';
import axios from "axios";

/**
 * Generates a rich text editor for comments made from Tiptap.js. Enabled features are Bold, Italic, and Link.
 * Underline feature is enabled but not accessible (no button for it).
 * @param {string} articleId - the ID of the article is needed for integrating the Post Comment functionality
 * @param {string} parentCommentID - the ID of the parent comment is needed for integrating the Reply Comment functionality
 * @param {boolean} isReply - default is false; set to true if the comment produced will be a reply to another comment
 */
export const CommentBox: React.FC<{
    articleId: string;
    parentCommentID?: string;
    isReply?: boolean;
    onCommentPosted?: () => void; // ADDED ON COMMENT POSTED
}> = ({
    articleId,
    parentCommentID = null,
    isReply = false,
    onCommentPosted, // DESTRUCTURE IT
}) => {
    const { user } = useAuthContext();
    const username: string = `${user ? (user.first_name + ' ' + user.last_name) : 'Loading...'}`;
    const profilePicture: string = ProfilePic;
    // const profilePicture: string = `${user ? (user.first_name + ' ' + user.last_name) : 'Loading...'}`;
    const [commentHTMLText, setCommentHTMLText] = useState<string>('');

    /**
     * Generates a rich text editor for comments made from Tiptap.js. Enabled features are Bold, Italic, and Link.
     * Underline feature is enabled but not accessible (no button for it).
     */
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ // declare disabled features as false
                // bold: true,
                // italic: true,
                // underline: false,
                strike: false,
                code: false,
                heading: false,
                blockquote: false,
                bulletList: false,
                orderedList: false,
            }),
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: commentHTMLText,
        onUpdate({ editor }) {
            setCommentHTMLText(editor.getHTML());
        },
    });

    const addLink = () => {
        const url = window.prompt('Enter a URL');
    
        if (url) {
          editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
    };
    
    // const removeLink = () => {
    //     editor?.chain().focus().unsetLink().run();
    // };

    const postComment = async ({
        articleId,
        text,
        parentCommentId,
      }: {
        articleId: string;
        text: string;
        parentCommentId: string;
      }) => {
        console.log('Posting comment:', {
          articleId,
          text,
          parentCommentId,
        });
        
        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/comments/origin/${articleId}`,
            {
              text,
              parent_comment_id: parentCommentId,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true, // MUST be here for cookies to be sent
            }
          );
      
        return response.data;
      };




      const handlePostComment = async () => {
        try {
            console.log('Posting comment:', {
                articleId,
                text: commentHTMLText,
                parentCommentId: parentCommentID,
            });
            
            const res = await postComment({
                articleId,
                text: commentHTMLText,
                parentCommentId: parentCommentID,
            });
            console.log('Comment created:', res);
            // clear editor content after submission
            editor?.commands.clearContent();
            // trigger a re-fetch of the comment thread
            onCommentPosted?.();
        } catch (err) {
            console.error('Failed to post comment:', err);
        }
    };


    return (
        <div className="w-full flex flex-col border border-2 border-Primary rounded-xl p-5">
            {/* user display */}
            <div className="flex gap-3 items-center">
                <img src={profilePicture} className="rounded-full h-14" />
                <h2 className="text-lg lg:text-xl text-Primary font-semibold">{username}</h2>
            </div>

            {/* text input */}
            <EditorContent editor={editor} className="comment-editor text-base text-Primary w-full mt-5 min-h-13 rounded-lg hover:bg-[#eef0f1] outline-none ring-0" />
            <hr className="text-LightGray border-1 my-5 mb-5"/>

            {/* actions */}
            <div className="flex justify-between items-center">
                <div className="flex gap-1">
                    {/* bold button */}
                    <button className={`hover:bg-LightGray p-1 rounded-lg ${editor?.isActive('bold') ? 'bg-Primary text-white' : 'text-Primary'}`}
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                    >
                        <Bold strokeWidth={3} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8"/>
                    </button>
                    {/* italic button */}
                    <button className={`hover:bg-LightGray p-1 rounded-lg ${editor?.isActive('italic') ? 'bg-Primary text-white' : 'text-Primary'}`}
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                    >
                        <Italic strokeWidth={3} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8"/>
                    </button>
                    <button className="hover:bg-LightGray p-1 rounded-lg text-Primary"
                        onClick={addLink}
                    >
                        <LinkIcon strokeWidth={3} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8"/>
                    </button>
                </div>
                <button className="bg-Secondary lg:bg-Primary text-white text-sm lg:text-lg font-semibold hover:bg-Gradient1 hover:brightness-110 py-2 px-4 lg:py-4 lg:px-6 rounded-sm lg:rounded-lg"
                    onClick={handlePostComment}
                >
                    {isReply? 'Reply' : 'Comment'}
                </button>
            </div>

            
        </div>
    );
};

/**
 * Purifies raw HTML strings, making it safe for displaying when using dangerouslySetInnerHTML.
 * Used when rich text (bold, underline, links) is involved.
 * @param {string} content - the text in HTML string format
 * 
 * @example
 * exampleString = '<p><strong>Re:Connect</strong> - Alumni <em>Tracker</em> and <em>Relations</em> <strong><em>Management System</em></strong></p>'
 * <h1><PurifyHTMLText content={exampleString} /></h1>
 */
export const PurifyHTMLText: React.FC<{ content: string }> = ({ content }) => {
    // concerned with the HTML only
    return (
        <> 
            <span
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(content),
                }}
            />
        </>
    );
  };