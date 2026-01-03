import { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [currentKeyword, setCurrentKeyword] = useState("");

  return (
    <SearchContext.Provider value={{ currentKeyword, setCurrentKeyword }}>
      {children}
    </SearchContext.Provider>
  );
}

export const useSearchKeyword = () => useContext(SearchContext);