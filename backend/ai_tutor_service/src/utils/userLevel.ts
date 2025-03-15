export const determineUserLevel = (age: number): string => {
    if (age >= 5 && age <= 8) return "beginner";
    if (age >= 9 && age <= 12) return "intermediate";
    return "advanced";
  };