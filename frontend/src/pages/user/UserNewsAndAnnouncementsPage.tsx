import { Link, useNavigate } from 'react-router-dom';
import BGImage from '../../assets/placeholders/bg_placeholder.avif';
import JUN from '../../assets/placeholders/pfp_placeholder.avif';
import ICSImage from '../../assets/placeholders/ICS_Placeholder.jpg';
import ReConnectLogo from '../../assets/logo.png';
import DesktopNavbar from '../../components/DesktopNavbar';
import UserNavbar from '../../components/UserNavbar';
import { useEffect, useMemo, useState } from 'react';
import { NewsAndArticlesSearchBar } from '../../components/SearchBar';
import { ArrowRight, SearchX } from 'lucide-react';
import { BackAndFontAndProfileHeader } from '../../components/MobileHeaders';
import axios from 'axios';
import { useAuthContext } from "../../hooks/useAuthContext";

const storyCategories = new Map<string, string>([
    ['ICSFaculty', 'ICS FACULTY'],
    ['studentAchievements', 'STUDENT ACHIEVEMENTS'],
    ['collegeEvents', 'COLLEGE EVENTS']
]);

interface ArticleProps {
    _id: string;
    created_at: Date;
    updated_at: Date;
    authorId: string;
    title: string;
    category: string;
    content: string;
    imageURL?: string;
    commentId: string;
};

const UserNewsAndArticlesPage: React.FC = () => {
    const { user } = useAuthContext();
    const [currentCategory, setCurrentCategory] = useState<string>('all');
    const [searchValue, setSearchValue] = useState<string>('');
    const [articles, setArticles] = useState<ArticleProps[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        skip: 0,
        limit: 10,
        total: 0,
        hasMore: true
    });

    // Fetch articles from API
    const fetchArticles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            var response = await axios.get(`${import.meta.env.VITE_API_URL}/articles`, {
                params: {
                    skip: pagination.skip,
                    limit: pagination.limit
                },
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true
            });


            console.log('Response from API:', response);
            

            
            const newArticles = response.data.articles.map((article: any) => ({
                ...article,
                created_at: new Date(article.created_at),
                updated_at: new Date(article.updated_at)
            }));
            
            console.log('Fetched articles:', newArticles);
            
            
            setArticles(prev => [...prev, ...newArticles]);
            setPagination(prev => ({
                ...prev,
                total: response.data.total,
                hasMore: response.data.hasMore
            }));
        } catch (err) {
            setError('Failed to fetch articles. Please try again later.');
            console.error('Error fetching articles:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchArticles();
    }, []);

    // Load more articles when needed
    const loadMoreArticles = () => {
        if (pagination.hasMore && !isLoading) {
            setPagination(prev => ({
                ...prev,
                skip: prev.skip + prev.limit
            }));
        }
    };

    // Fetch more when pagination changes
    useEffect(() => {
        if (pagination.skip > 0) {
            fetchArticles();
        }
    }, [pagination.skip]);

    // Derived filtered list based on category and search term
    const filteredArticles = useMemo(() => {
        let filtered = articles;

        if (currentCategory !== 'all') {
            filtered = filtered.filter(news => news.category === currentCategory);
        }

        if (searchValue.trim() !== '') {
            filtered = filtered.filter(news =>
                news.title.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        return filtered;
    }, [articles, currentCategory, searchValue]);

    return (
        <>
            <UserNavbar activePage='Home' />
            <DesktopNavbar activePage='Home' />
            <BackAndFontAndProfileHeader className='px-6' />

            <div className="flex items-center justify-center overflow-hidden">
                {/* limit the page to 1280px */}
                <div className="max-w-[1280px] w-full flex flex-col justify-center items-center">
                    <FeaturedImage />
                    <FeaturedStory />

                    <hr className="w-screen py-1 border-LightGray" />
                    <div className="flex flex-col justify-between w-full gap-6 px-8 lg:flex-row lg:gap-10">
                        <CategoryTabs 
                            activeCategory={currentCategory} 
                            setActiveCategory={setCurrentCategory} 
                            className="flex-none place-self-center" 
                        />
                        <NewsAndArticlesSearchBar 
                            searchValue={searchValue} 
                            setSearchValue={setSearchValue} 
                            className="flex-grow" 
                        />
                    </div>
                    <br />

                    {/* Loading indicator */}
                    {isLoading && articles.length === 0 && (
                        <div className="w-full flex justify-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-Secondary"></div>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="text-red-500 text-center py-5">
                            {error}
                        </div>
                    )}

                    {/* no articles indicator */}
                    {!isLoading && filteredArticles.length === 0 && (
                        <h1 className="flex gap-2">
                            No results found <SearchX />
                        </h1>
                    )}

                    {/* masonry style gridview of News Cards Columns */}
                    <div className="w-5/6 gap-5 mx-auto columns-1 sm:columns-2 md:columns-3">
                        {filteredArticles.map((article) => (
                            <div key={article._id} className="mb-5 break-inside-avoid">
                                <NewsCard 
                                    id={article._id} 
                                    title={article.title} 
                                    category={article.category} 
                                    imageURL={article.imageURL} 
                                />
                            </div>
                        ))}
                    </div>

                    {/* Load more button */}
                    {pagination.hasMore && !isLoading && (
                        <button 
                            onClick={loadMoreArticles}
                            className="px-6 py-2 mt-6 mb-10 text-white rounded-lg bg-Secondary hover:bg-DarkerPrimary transition-colors"
                            disabled={isLoading}
                        >
                            Load More Articles
                        </button>
                    )}

                    {/* Loading indicator for pagination */}
                    {isLoading && articles.length > 0 && (
                        <div className="w-full flex justify-center py-5">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-Secondary"></div>
                        </div>
                    )}

                    {/* space for aesthetic */}
                    <div className="w-full h-20 md:h-30 lg:h-50" />
                </div>
            </div>
        </>
    )
};

/**
 * A category tab selector for news story filtering in the News and Article Page.
 * @param {string} activeCategory - for controlling which category is active, the active category is highlighted by a bright bottom border
 * @param {function} setActiveCategory - changes the active category to the selected category
 * @param {string} className - for additional styling / overriding styling
 */
const CategoryTabs: React.FC<{
    activeCategory: string
    setActiveCategory: (category: string) => void;
    className?: string
}> = ({
    activeCategory,
    setActiveCategory,
    className = ''
}) => {
        return (
            <div className={`flex text-xs md:text-sm lg:text-lg font-medium text-DarkerPrimary h-15 ${className}`}>
                <button className={`border-b-3 ${(activeCategory == 'all') ? 'border-Secondary font-semibold' : 'border-LightGray'} px-4`}
                    onClick={() => setActiveCategory('all')}
                >
                    ALL STORIES
                </button>
                <button className={`border-b-3 ${(activeCategory == 'ICSFaculty') ? 'border-Secondary font-semibold' : 'border-LightGray'} px-4`}
                    onClick={() => setActiveCategory('ICSFaculty')}
                >
                    ICS FACULTY
                </button>
                <button className={`border-b-3 ${(activeCategory == 'studentAchievements') ? 'border-Secondary font-semibold' : 'border-LightGray'} px-4`}
                    onClick={() => setActiveCategory('studentAchievements')}
                >
                    STUDENT ACHIEVEMENTS
                </button>
                <button className={`border-b-3 ${(activeCategory == 'collegeEvents') ? 'border-Secondary font-semibold' : 'border-LightGray'} px-4`}
                    onClick={() => setActiveCategory('collegeEvents')}
                >
                    COLLEGE EVENTS
                </button>
            </div>
        );
    }

/**
 * A card component for stories/new/articles in the News and Articles Page.
 * 
 * The height of photoframe on mobile view is h-56. On desktop view, it has varying heights.
 * @param {string} id - for storing the article object's id
 * @param {string} title - for displaying the article title
 * @param {string} category - the object's category, for filtering. Categories are: ICSFaculty, studentAchievements, collegeEvents
 * @param {string} imageURL - for displaying the object's image. If no image is provided, placeholder will be the application's logo.
 */
const NewsCard: React.FC<{
    id: string,
    title: string,
    category: string,
    imageURL?: string
}> = ({
    id,
    title,
    category,
    imageURL = ReConnectLogo
}) => {
        const randomClass = useMemo(() => {
            // const randomHeights:string[] = ['sm:h-56', 'sm:h-64', 'sm:h-72']; // 3 options
            const randomHeights: string[] = ['sm:h-56', 'sm:h-64', 'sm:h-72']; // 2 options
            return randomHeights[Math.floor(Math.random() * randomHeights.length)];
        }, []);
        const navigate = useNavigate();

        // ADDED FUNCTION FOR NAVIGATION WHEN NEWSCARD IS CLICKED
        const handleClick = () => {
            navigate(`/user/news/${id}`);
        };

        return (
            //  INTEGRATED GET SINGLE ARTICLE BY ID, REDIRECTS TO THE ARTICLE DETAILS PAGE
            <button id={id} className="flex flex-col w-full" onClick={handleClick}>
                <div className={`h-56 ${randomClass} overflow-hidden rounded-3xl sm:rounded-2xl relative`}>
                    <img src={imageURL} className="object-cover w-full h-full" />
                    <BlueImageOverlay />
                </div>
                <h2 className="text-xl font-semibold text-DarkerPrimary leading-[1.15] pt-3 pb-2 px-1">{title}</h2>
                <h3 className="px-1 pb-1 text-sm font-medium text-DarkerPrimary">{storyCategories.get(category)}</h3>
            </button>
        );
    }

/**
 * A transparent blue linear gradient overlay to be placed on 
 * top of images in the News and Articles Page for color harmony.
 */
const BlueImageOverlay: React.FC = () => {
    return (
        <div className="h-full w-full absolute top-0 bg-linear-to-b from-transparent to-[#00ACED] opacity-40"></div>
    );
}

/**
 * A responsive featured image component that greets the user upon launching the desktop view of News and Articles Page.
 * The short description shown is the first two lines of the featured story's content, the third line is replaced with an ellipsis.
 * @param {string} className - for additional styling / overriding styling
 */
const FeaturedImage: React.FC = () => {
    const category: string = 'ICSFaculty';
    const title: string = 'ICS Welcomes New Faculty Members';
    const content: string = 'A group led by Assistant Professor Reginald Neil Recario, together with Mr. Jenel Justo, and Mr. Ronnel Valencia, participated in the Future of Information and Communication Conference (FICC) 2024 held last April 4-5, 2024 in Berlin, Germany.<br><br>Mr. Valencia presented the research work titled&nbsp;<strong>A Non-transfer Learning Approach in Exploring the Variations of Extractive Summarization Components for a Low-Resource Language</strong>.&nbsp;On the other hand, Mr. Justo co-presented with Asst. Prof. Recario the research work titled&nbsp;<strong>Text Simplification System for Legal Contract Review</strong>. Mr. Valencia and Mr. Justo, both Final Year Project (Special Problems) advisees of Asst. Prof. Recario, are from BSCS class 2023 who graduated with honors Magna cum laude and Summa cum laude respectively.<br><br>The FICC 2024 provides a venue to explore the latest advancements and trends in information and communication bringing together leading academics, researchers, and industry professionals from around the globe. The conference featured a series of keynote speeches and technical sessions addressing a wide range of topics such as artificial intelligence, computing, and data science.</p>';

    return (
        <div className="w-5/6 m-10 h-[60vh] relative rounded-xl overflow-hidden hidden lg:block">
            <img src={ICSImage} className="object-cover w-full h-full" />
            <BlueImageOverlay />
            <div className="w-2/5 h-[45%] flex flex-col gap-3 justify-between bg-Secondary rounded-xl p-5 absolute bottom-10 left-10">
                <h3 className="text-sm font-medium text-white">{storyCategories.get(category)}</h3>

                <div>
                    <h1 className="text-3xl font-semibold leading-none text-white line-clamp-2">{title}</h1>
                    <h2 className="pt-2 text-base leading-none text-white line-clamp-2"
                        style={{ whiteSpace: "pre-line" }}>{content}</h2>
                </div>

                {/* FOR INTEGRATION: redirects to page details containing news details */}
                <Link to={'/user/news/details'}>
                    <h3 className="text-sm font-bold text-white underline">READ MORE</h3>
                </Link>
            </div>
        </div>
    );
}

/**
 * A featured story component seen in the mobile view of News and Articles Page.
 * The short description shown is the first two lines of the featured story's content, the third line is replaced with an ellipsis.
 * @param {string} className - for additional styling / overriding styling
 */
const FeaturedStory: React.FC = () => {
    const title: string = 'ICS Welcomes New Faculty Members';
    const content: string = 'A group led by Assistant Professor Reginald Neil Recario, together with Mr. Jenel Justo, and Mr. Ronnel Valencia, participated in the Future of Information and Communication Conference (FICC) 2024 held last April 4-5, 2024 in Berlin, Germany.<br><br>Mr. Valencia presented the research work titled&nbsp;<strong>A Non-transfer Learning Approach in Exploring the Variations of Extractive Summarization Components for a Low-Resource Language</strong>.&nbsp;On the other hand, Mr. Justo co-presented with Asst. Prof. Recario the research work titled&nbsp;<strong>Text Simplification System for Legal Contract Review</strong>. Mr. Valencia and Mr. Justo, both Final Year Project (Special Problems) advisees of Asst. Prof. Recario, are from BSCS class 2023 who graduated with honors Magna cum laude and Summa cum laude respectively.<br><br>The FICC 2024 provides a venue to explore the latest advancements and trends in information and communication bringing together leading academics, researchers, and industry professionals from around the globe. The conference featured a series of keynote speeches and technical sessions addressing a wide range of topics such as artificial intelligence, computing, and data science.</p>';

    return (
        <>
            <div className="my-5 mx-3 h-[30vh] relative rounded-3xl overflow-hidden lg:hidden">
                <img src={ICSImage} className="object-cover w-full h-full" />
                <BlueImageOverlay />
            </div>
            <div className="flex flex-col justify-between gap-4 mx-6 mb-8 lg:hidden">
                <h3 className="text-sm font-medium text-DarkerPrimary">FEATURED STORIES</h3>

                <h1 className="text-3xl font-bold leading-none text-DarkerPrimary line-clamp-2">{title}</h1>
                <h2 className="text-base leading-none text-DarkerPrimary line-clamp-2"
                    style={{ whiteSpace: "pre-line" }}>{content}</h2>

                {/* FOR INTEGRATION: redirects to page details containing news details */}
                <Link to={'/user/news/details'}>
                    <h3 className="flex items-center gap-2 text-sm font-medium text-DarkerPrimary">
                        <ArrowRight />READ MORE
                    </h3>
                </Link>
            </div>
        </>
    );
}

export default UserNewsAndArticlesPage;