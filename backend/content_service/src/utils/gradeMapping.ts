export const mapAgeToGradeAndDifficulty = (age: number): { gradeLevel: number, difficultyLevel: "beginner" | "intermediate" | "advanced" } => {
    if (age >= 5 && age <= 6) return { gradeLevel: 1, difficultyLevel: "beginner" };
    if (age === 7) return { gradeLevel: 2, difficultyLevel: "beginner" };
    if (age === 8) return { gradeLevel: 3, difficultyLevel: "beginner" };
    if (age === 9) return { gradeLevel: 4, difficultyLevel: "beginner" };
    if (age === 10) return { gradeLevel: 5, difficultyLevel: "intermediate" };
    if (age === 11) return { gradeLevel: 6, difficultyLevel: "intermediate" };
    if (age === 12) return { gradeLevel: 7, difficultyLevel: "intermediate" };
    if (age === 13) return { gradeLevel: 8, difficultyLevel: "advanced" };
    if (age === 14) return { gradeLevel: 9, difficultyLevel: "advanced" };
    if (age === 15) return { gradeLevel: 10, difficultyLevel: "advanced" };
    if (age === 16) return { gradeLevel: 11, difficultyLevel: "advanced" };
    if (age >= 17 && age <= 18) return { gradeLevel: 12, difficultyLevel: "advanced" };

    return { gradeLevel: 1, difficultyLevel: "beginner" };
  };
  