import { Request, Response } from "express";
import Course from "../models/coursesModel";
import { generateQuizzes } from "../utils/geminiService";
import Quiz from "../models/LessonQuiz";
import { getAllCoursesBySubjectService, getAllCoursesService, getCourseWithLessonsService, getFilteredCoursesService, getLessonByIdService, searchCoursesService } from "../services/courseServices";
import CustomError from "../utils/customError";
import { mapAgeToGradeAndDifficulty } from "../utils/gradeMapping";
import { publishToQueue } from "../utils/rabbitmq/rabbitmqPublish";
import { getUserData } from "../consumers/userConsumers";
import { uploadToS3 } from "../middlewares/upload";



declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}
interface UserData {
    _id: string;
    name: string;
    email: string;
    age: number;
    phone: string;
    role: string;
    profilePic: string;
    createdAt: Date;
    updatedAt: Date;
}

interface AuthRequest extends Request {
  user?: { _id: string };
}

export const getAllCourses = async( req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const subject = (req.query.subject as string)
    const grade = parseInt(req.query.grade as string);
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)

    console.log("query.grade raw value:", req.query.search);

    const filter: any = {};

    const validSubjects = ["maths", "science", "english", "coding", "history"];
    if (subject && validSubjects.includes(subject)) {
      filter.subject = subject;
    }

    if (!isNaN(grade)) {
      filter.gradeLevel = grade;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } }
      ];
    }
    filter.isDeleted = false;
    
    const { courses, totalCourses } = await getAllCoursesService({ skip, limit, filter });
    const totalPages = Math.ceil(totalCourses / limit);
    // console.log("good", courses);
    res.status(200).json({status:"success", message:'All Courses fetched successfully', 
      data:{
        courses,
        pagination: {
          totalCourses,
          totalPages,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      }
  });
};

// export const getAllCoursesBySubject = async(req:AuthRequest, res:Response) => {
    
//     const { subject } = req.params;
//     if (!req.user || !req.user._id) {
//         throw new CustomError("Unauthorized access. User ID not found.", 401);
//       }
//     const userId = req.user._id;
      
//     await publishToQueue("user_id", userId);
//     await new Promise((resolve) => setTimeout(resolve, 1500));

//     let userData = (await getUserData(userId)) as UserData | undefined;

//     if (!userData) {
//         throw new CustomError("User data not found. Try again later.", 400);
//     }

//     if (userData instanceof Map) {
//         userData = Object.fromEntries(userData) as UserData;
//     }
//     const  age  = userData.age;
//     if (!age) {     
//         throw new CustomError("User age not found in token", 400);
//       }
//     const { gradeLevel, difficultyLevel } = mapAgeToGradeAndDifficulty(age);
//     const { courses } = await getAllCoursesBySubjectService(subject, gradeLevel);
//     console.log("ru4",courses);
//     return res.status(200).json({ status:"success", message: "Courses By Subject fetched succcessfully", data: courses});
// };


export const getAllCoursesBySubject = async (req: AuthRequest, res: Response) => {
  console.log("Step 1: Request Received");

  const { subject } = req.params;

  if (!req.user || !req.user._id) {
    throw new CustomError("Unauthorized access. User ID not found.", 401);
  }

  const userId = req.user._id;

  // Publishing to queue asynchronously (non-blocking)
  console.log("Step 2: Publishing to queue...");
  publishToQueue("user_id", userId);
  console.log("Step 2: Queue published.");

  // Fetch user data
  console.log("Step 3: Fetching user data...");
  let userData;
  try {
    userData = await getUserData(userId) as UserData;
  } catch (err) {
    console.error("Error fetching user data:", err);
    throw new CustomError("User data not found. Try again later.", 400);
  }

  if (!userData) {
    throw new CustomError("User data not found. Try again later.", 400);
  }

  console.log("Step 4: User data fetched, processing age...");
  if (userData instanceof Map) {
    userData = Object.fromEntries(userData) as UserData;
  }

  const age = userData.age;
  if (!age) {
    throw new CustomError("User age not found in token", 400);
  }

  // Fetch courses by subject and gradeLevel
  console.log("Step 5: Mapping age to gradeLevel and difficultyLevel...");
  const { gradeLevel, difficultyLevel } = mapAgeToGradeAndDifficulty(age);

  console.log("Step 6: Fetching courses...");
  let courses;
  try {
    courses = await getAllCoursesBySubjectService(subject, gradeLevel);
  } catch (err) {
    console.error("Error fetching courses:", err);
    throw new CustomError("Error fetching courses by subject.", 500);
  }

  console.log("Step 7: Courses fetched, sending response.");
  res.status(200).json({
    status: "success",
    message: "Courses by subject fetched successfully",
    data: courses,
  });
};


export const getCourseWithLessons = async(req:Request, res:Response) => {
    const { courseId } = req.params;
    const { course, lessons } = await getCourseWithLessonsService(courseId);
    res.status(200).json({status: "success", message:'Lessons fetched successfully', data: {course, lessons}});
};

export const getLessonById = async(req:Request, res:Response) => {
    const { lessonId } = req.params;
    const { lesson } = await getLessonByIdService(lessonId);
    res.status(200).json({status: "success", message:'Lesson fetched successfully', data:lesson});
};

export const searchCourses = async (req: Request, res: Response) => {
  const { subject, level } = req.query;
  const { courses } = await searchCoursesService(
    subject as string | undefined,
    level as string | undefined
  );
  res
    .status(200)
    .json({
      status: "success",
      message: "Search is successfull",
      data: courses,
    });
};


export const generateCourseQuizzesService = async (
    req: Request,
    res: Response
  ) => {
    const { courseId } = req.body;
  
    const existingQuiz = await Quiz.findOne({ courseId });
    if (existingQuiz) {
      return res.status(200).json({
        message: "Quiz already exists for this course",
        questions: existingQuiz.quizzes,
      });
    }
  
    const course = await Course.findById(courseId);
    if (!course) throw new CustomError("Course not found", 404);
  
    const { title, subject, description } = course;
  
    const prompt = `
      Generate 10 multiple choice quiz questions for kids aged 5 to 18.
      Use the following course information:
      Title: "${title}"
      Subject: "${subject}"
      Description: "${description}"
  
      Output format (JSON only):
      {
        "quizzes": [
          {
            "question": "Question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "Option A",
            "explanation": "Simple explanation why this is the correct answer",
            "subject": "${subject}",
            "difficulty": "easy"
          }
        ]
      }
  
      Keep the language simple and fun for kids.
    `;
  
    const aiResponse = await generateQuizzes(prompt);
  
    let parsedQuizResponse;
    try {
      const cleanedResponse = aiResponse
        .replace(/```json?/g, "")
        .replace(/```/g, "")
        .trim();
  
      parsedQuizResponse = JSON.parse(cleanedResponse);
      if (
        !Array.isArray(parsedQuizResponse.quizzes) ||
        parsedQuizResponse.quizzes.length === 0
      ) {
        throw new Error("No quizzes found");
      }
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      throw new CustomError("Invalid AI response format", 500);
    }
  
    const formattedQuestions = parsedQuizResponse.quizzes.map((q: any) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      subject: q.subject,
      difficulty: q.difficulty,
    }));
  
    const newQuiz = await Quiz.create({
      courseId,
      quizzes: formattedQuestions,
    });
  
    return res.status(201).json({
      message: "Quizzes generated and saved",
      questions: newQuiz.quizzes,
    });
  };
  

export const fetchLessonQuiz = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const quiz = await Quiz.findOne({ courseId });
  if (!quiz) {
    throw new CustomError("NO quiz found for this lesson", 400);
  }
   function shuffleArray<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
  }

  const formatQuizQuestion = quiz.quizzes.map((q: any) => ({
    question: q.question,
    options: shuffleArray(q.options),
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    subject: q.subject,
    difficulty: q.difficulty,
  }));

  return res.status(200).json({ message: "quiz fetched successfully", quiz : formatQuizQuestion });
};

export const getFilteredCourses = async(req: Request, res: Response) => {
    const { subject } = req.params;
    const { gradeLevel, difficultyLevel } = req.query;
  
    const { courses } = await getFilteredCoursesService(subject, gradeLevel as string | undefined, difficultyLevel as string | undefined);
    res.status(200).json({status: "success", message: "Filtration is successful", data: courses});
};

export const addCourse = async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File;

  if (!file) {
    throw new CustomError("Thumbnail image is required",400);
  }
  const imageUrl = await uploadToS3(file);
  const course = await Course.create({
    ...req.body,
    thumbnail: imageUrl,
  });

  res.status(201).json({status: "success", message: "New course added successfully", data: course});
};

export const editCourse = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const file = req.file as Express.Multer.File;

  let updatedFields: any = { ...req.body };

  if (file) {
    const imageUrl = await uploadToS3(file);
    updatedFields.thumbnail = imageUrl;
  }

  const course = await Course.findByIdAndUpdate(courseId, updatedFields, {
    new: true, // return the updated document
    runValidators: true, // run schema validators
  });

  if (!course) {
    throw new CustomError("Course not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Course updated successfully",
    data: course,
  });
};

export const deleteCourse = async (req: Request, res: Response) => {
  const { courseId } = req.params;

  if (!courseId) {
    throw new CustomError("Course not found", 404);
  }
  const course = await Course.findByIdAndUpdate(courseId, {$set: {isDeleted: true}},{new:true})

  if (!course) {
    throw new CustomError("Course not found", 404);
  }

  return res.status(200).json({
    status: "success",
    message: "Course deleted successfully",
    data: course,
  });
};
