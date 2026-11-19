import { useContext } from "react";
import { ArticlesContext } from "../context/ArticlesContext";
import { ArticlesContextType } from "../context/ArticlesContext";

export const useArticlesContext = () => {
  const context = useContext(ArticlesContext);

  if (!context) {
    throw new Error("useArticlesContext must be used within an EventsContextProvider");
  }

  return context as ArticlesContextType;
};
