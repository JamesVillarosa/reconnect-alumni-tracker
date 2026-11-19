import { createContext, useState, useEffect, ReactNode } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import axios from "axios";

// @TODO: Add types for article properties
export type ArticleProps = Record<string, any>;

export type ArticlesContextType = {
  allArticles: ArticleProps[];
  setAllArticles: React.Dispatch<React.SetStateAction<ArticleProps[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  total: number;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  fetchArticles: (page?: number, limit?: number) => Promise<void>;
};

export const ArticlesContext = createContext<ArticlesContextType | null>(null);

export const ArticlesContextProvider = ({ children }: { children: ReactNode }) => {
  const [allArticles, setAllArticles] = useState<ArticleProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const { user } = useAuthContext();

  const fetchArticles = async (page = 1, limit = 5) => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/articles/`, {
        params: {
          skip: (page - 1) * limit,
          limit,
        },
        withCredentials: true,
      });

      setAllArticles(response.data.articles);
      setTotal(response.data.total);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setAllArticles([]);
        setTotal(0);
        setError("No articles found.");
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError("Failed to fetch articles. Please try again.");
      }
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchArticles();
    }
  }, [user]);

  return (
    <ArticlesContext.Provider
      value={{
        allArticles,
        setAllArticles,
        loading,
        setLoading,
        error,
        setError,
        fetchArticles,
        total,
        setTotal
      }}>
      {children}
    </ArticlesContext.Provider>
  );
};
