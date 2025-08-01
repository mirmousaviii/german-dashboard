import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Language } from "./useTranslations";
import {
  getLanguageFromPath,
  getPageFromPath,
  buildUrl,
  PageType,
  AVAILABLE_PAGES,
  isLanguageValid,
} from "../routes";

export const useRouting = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(() =>
    getLanguageFromPath(location.pathname)
  );
  const [currentPage, setCurrentPage] = useState<PageType>(() =>
    getPageFromPath(location.pathname)
  );
  const [isPageValid, setIsPageValid] = useState<boolean>(() => {
    // Special handling for root path
    if (location.pathname === "/") {
      return true; // Root path is always valid, RootHandler will handle it
    }
    const page = getPageFromPath(location.pathname);
    const languageValid = isLanguageValid(location.pathname);
    return AVAILABLE_PAGES.includes(page) && page !== "404" && languageValid;
  });

  // Update state when URL changes
  useEffect(() => {
    // Special handling for root path
    if (location.pathname === "/") {
      setCurrentLanguage(null);
      setCurrentPage("home");
      setIsPageValid(true); // Root path is always valid, RootHandler will handle it
      return;
    }

    const newLanguage = getLanguageFromPath(location.pathname);
    const newPage = getPageFromPath(location.pathname);
    const languageValid = isLanguageValid(location.pathname);

    setCurrentLanguage(newLanguage);
    setCurrentPage(newPage);
    setIsPageValid(
      AVAILABLE_PAGES.includes(newPage) && newPage !== "404" && languageValid
    );
  }, [location.pathname]);

  // Function to change language
  const changeLanguage = (newLanguage: Language) => {
    const newUrl = buildUrl(newLanguage, currentPage || "home");
    navigate(newUrl);
  };

  // Function to change page (string-based for compatibility with existing components)
  const changePage = (newPage: string) => {
    const pageType = newPage as PageType;
    if (pageType && AVAILABLE_PAGES.includes(pageType)) {
      const newUrl = buildUrl(currentLanguage || "en", pageType);
      navigate(newUrl);
    }
  };

  // Function to change both language and page
  const changeLanguageAndPage = (newLanguage: Language, newPage: PageType) => {
    const newUrl = buildUrl(newLanguage, newPage);
    navigate(newUrl);
  };

  return {
    currentLanguage: currentLanguage || "en",
    currentPage,
    isPageValid,
    changeLanguage,
    changePage,
    changeLanguageAndPage,
  };
};
