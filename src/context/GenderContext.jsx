import { createContext, useState } from 'react';

export const GenderContext = createContext(null);

export function GenderProvider({ children }) {
  const [selectedGender, setSelectedGender] = useState("Women");

  const matchesGender = (category) => {
    if (selectedGender === "Men") return category !== "women's clothing";
    if (selectedGender === "Women") return category !== "men's clothing";
    return false;
  };

  return (
    <GenderContext.Provider value={{ selectedGender, setSelectedGender, matchesGender }}>
      {children}
    </GenderContext.Provider>
  );
}