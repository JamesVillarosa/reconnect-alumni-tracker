import { Search } from "lucide-react";

/**
 * A search bar for news story filtering in the News and Article Page.
 * @param {string} searchValue - for controlling passing the search value to the filters in News and Article Page
 * @param {function} setSearchValue - updates the search value
 * @param {string} className - for additional styling / overriding styling
 */
export const NewsAndArticlesSearchBar: React.FC<{
    searchValue: string
    setSearchValue: (value: string) => void;
    className?: string
}> = ({
    searchValue,
    setSearchValue,
    className = ''
}) => {
    return (
        <div className={`flex items-center text-sm lg:text-lg font-medium border border-[#B9D5EB] rounded-lg text-DarkerPrimary p-3 h-15 ${className}`}>
            <input 
                type="text" 
                id="news_search" 
                name="search_news"
                placeholder="SEARCH"
                value={searchValue}
                onChange={(e) => {setSearchValue(e.target.value)}}
                className="placeholder-DarkerPrimary focus:outline-none w-1 flex-grow focus:ring-0"
            />
            <button><Search /></button>
        </div>
    );
}