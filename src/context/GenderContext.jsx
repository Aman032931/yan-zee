import { createContext, useState } from 'react';

export const GenderContext = createContext(null);

// Which backend `audience` values each header selection shows.
const AUDIENCES_BY_GENDER = {
  men: ['MEN', 'UNISEX'],
  women: ['WOMEN', 'UNISEX'],
  boy: ['BOY', 'KIDS_UNISEX'],
  girl: ['GIRL', 'KIDS_UNISEX'],
  kid: ['BOY', 'GIRL', 'KIDS_UNISEX'],
};

export function GenderProvider({ children }) {
  const [selectedGender, setSelectedGender] = useState("Women");

  // `audience` is the backend value on a product, e.g. "MEN" or "UNISEX"
  const matchesGender = (audience) => {
    const key = selectedGender.toLowerCase().replace(/s$/, '');
    const allowed = AUDIENCES_BY_GENDER[key];
    if (!allowed) return true; // unknown selection: don't hide anything
    return allowed.includes(audience);
  };

  return (
    <GenderContext.Provider value={{ selectedGender, setSelectedGender, matchesGender }}>
      {children}
    </GenderContext.Provider>
  );
}