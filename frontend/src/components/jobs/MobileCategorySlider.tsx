import React, { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  Smartphone,
  Database,
  Code,
  Layers,
  Paintbrush,
  Bug,
  Server,
  BarChart2,
  ClipboardList,
} from "lucide-react";

/**
 * MobileCategorySlider Component
 *
 * @param {Object} props - The component props.
 * @param {string} props.category - The currently selected category.
 * @param {Function} props.setCategory - Function to update the selected category.
 * @returns {JSX.Element} A horizontally scrollable slider for job categories.
 */
const MobileCategorySlider: React.FC<{
  category: string[];
  setCategory: React.Dispatch<React.SetStateAction<string[]>>;
  callAPI: () => void;
}> = ({ category, setCategory, callAPI }) => {
  // Job roles data now internal to the component
  const jobRoles = [
    { title: "Web Developer", icon: <Briefcase size={36} /> },
    { title: "Mobile Developer", icon: <Smartphone size={36} /> },
    { title: "Backend Developer", icon: <Database size={36} /> },
    { title: "Frontend Developer", icon: <Code size={36} /> },
    { title: "Full Stack Developer", icon: <Layers size={36} /> },
    { title: "UI/UX Developer", icon: <Paintbrush size={36} /> },
    { title: "QA Tester", icon: <Bug size={36} /> },
    { title: "DevOps Engineer", icon: <Server size={36} /> },
    { title: "Data Analyst", icon: <BarChart2 size={36} /> },
    { title: "Project Manager", icon: <ClipboardList size={36} /> },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  let scrollTimeout: NodeJS.Timeout | null = null;

  // hover to scroll right a bit, only if at scroll position 0 (indicates that the bar is scrollable)
  const handleMouseEnter = () => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer && scrollPosition === 0) {
      if (scrollTimeout) clearTimeout(scrollTimeout); // Clear any existing timeout
      {
        scrollContainer.scrollTo({ left: 100, behavior: "smooth" }); // Scroll right a bit
        scrollTimeout = setTimeout(() => {
          scrollContainer.scrollTo({ left: 0, behavior: "smooth" }); // Scroll back
        }, 300);
      }
    }
  };

  // Trigger the scroll animation on mount
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      // scroll to the right
      scrollContainer.scrollTo({ left: 1000, behavior: "smooth" });

      // scroll back to the start after n delay
      const timeout = setTimeout(() => {
        scrollContainer.scrollTo({ left: 0, behavior: "smooth" });
      }, 1000);

      return () => clearTimeout(timeout); // cleanup
    }
  }, []);

  return (
    <div
      ref={scrollRef}
      className="flex flex-row max-w-full gap-4 p-4 pt-2 overflow-x-scroll scroll-smooth no-scrollbar text-white"
      onMouseEnter={handleMouseEnter}
      onScroll={
        // Update scroll position on scroll
        () => {
          if (scrollRef.current)
            setScrollPosition(scrollRef.current.scrollLeft);
        }
      }
    >
      {jobRoles.map((role, index) => (
        <div
          key={`role-${role.title}-${index}`}
          className="flex flex-col items-center justify-center cursor-pointer"
          onClick={() => {
            setCategory((prevSelected: string[]) => {
              if (prevSelected.includes(role.title)) {
                return prevSelected.filter((c) => c !== role.title); // remove
              } else {
                return [...prevSelected, role.title]; // add
              }
            });

            callAPI();
          }}
        >
          <div
            className={`transition-all duration-150 flex flex-col border-[3px] border-white items-center justify-center p-4 w-min rounded-2xl ${
              category.includes(role.title)
                ? "bg-white text-Primary"
                : "bg-none text-white"
            }`}
          >
            {role.icon}
          </div>
          <p
            className={`mt-2 text-xs font-semibold text-center max-w-min transition-all duration-100 text-white`}
          >
            {role.title}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MobileCategorySlider;
