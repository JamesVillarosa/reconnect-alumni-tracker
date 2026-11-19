import React, { useState } from 'react';
import articlesImageOne from "../assets/homepage_announcements_one.png";
import { useArticlesContext } from '../hooks/useArticlesContext';

// articles test case
// const articles = [
//     { title: "ICS Welcomes New Faculty Members", image: articlesImageOne, url: "" },
//     { title: "ICS Faculty and Alumnus Present Research at ICCCI 2024 in Japan", image: "https://ics.uplb.edu.ph/wp-content/uploads/2024/06/20240615_205114.jpg", url: "" },
//     { title: "ICS Team Attends FICC 2024 in Berlin", image: "https://ics.uplb.edu.ph/wp-content/uploads/2024/05/FICC2024_REG-2048x1536.jpg", url: "" },
//     { title: "ICS Facilities Renamed to Honor Pioneering Computer Science Professors", image: "https://ics.uplb.edu.ph/wp-content/uploads/2024/06/immortal1-2048x1152.jpg", url: "" },
// ];

const ArticlesCarousel: React.FC = () => {
    // articles state
    const { allArticles: articles } = useArticlesContext();
    const [currentArticles, setCurrentArticles] = useState(0);

    // carousel next button
    const handleNext = () => {
        setCurrentArticles((prev) => (prev + 1) % articles.length);
    };

    // carousel previous button
    const handlePrev = () => {
        setCurrentArticles((prev) => (prev - 1 + articles.length) % articles.length);
    };

    return (
        <div className="relative flex flex-col items-center w-full">
            {/* carousel */}
            <div className='relative w-full max-w-4xl overflow-hidden rounded-2xl'>
                <div className='flex transition-transform duration-500 ease-in-out' style={{ transform: `translateX(-${currentArticles * 100}%)` }}>
                    {articles.map((article, index) => (
                        <div key={index} className='flex items-center justify-center w-full min-w-full rounded-2xl max-h-64'>
                            <img src={article.imageURL} className='object-cover w-full h-full rounded-t-2xl' />
                        </div>
                    ))}
                </div>
            </div>
            {/* carousel buttons and title */}
            <div className='flex items-center justify-between w-full mt-4 mb-4'>
                <button onClick={handlePrev} className='px-6 py-6 text-xl text-white border-none btn btn-circle rounded-4xl bg-gradient-to-t from-Secondary to-Primary'>
                    ❮
                </button>
                <div className='flex items-center justify-center w-full px-4 h-15'>
                    <p className='flex items-center text-xl font-semibold !line-clamp-2 text-Primary text-center break-words'>{articles[currentArticles]?.title}</p>
                </div>
                <button onClick={handleNext} className='px-6 py-6 text-xl text-white border-none btn btn-circle rounded-4xl bg-gradient-to-t from-Secondary to-Primary'>
                    ❯
                </button>
            </div>
        </div>
    );
};

export default ArticlesCarousel;