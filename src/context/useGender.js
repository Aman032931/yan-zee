
import { useContext } from 'react';
import { GenderContext } from './GenderContext';

export function useGender() {
  const ctx = useContext(GenderContext);
  if (!ctx) throw new Error("useGender must be used within a GenderProvider");
  return ctx;
}