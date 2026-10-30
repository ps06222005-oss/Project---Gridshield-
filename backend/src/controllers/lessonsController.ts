import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Lesson } from '../models/Lesson';
import { submitQuiz as submitQuizSvc, getCompletedLessonSlugs } from '../services/lessonService';
import { getUserByFirebaseUid, findOrCreateUser } from '../services/userService';
import { HttpError } from '../middleware/errorHandler';

async function resolveUser(req: Request) {
  const uid = req.user!.uid;
  let user = await getUserByFirebaseUid(uid);
  if (!user) {
    user = await findOrCreateUser({ firebaseUid: uid, name: req.user!.name ?? 'Green Guardian' });
  }
  return user;
}

/** Strip correctAnswerIndex from quiz questions before sending to client */
function sanitizeLesson(lesson: InstanceType<typeof Lesson>) {
  const obj = lesson.toObject();
  const quiz = obj.quiz.map(({ question, options, explanation }: {
    question: string; options: string[]; correctAnswerIndex?: number; explanation: string;
  }) => ({ question, options, explanation }));
  return { ...obj, quiz };
}

export async function listLessons(req: Request, res: Response, next: NextFunction) {
  try {
    const lessons = await Lesson.find({ isActive: true });
    // Optionally enrich with completion status if authenticated
    let completedSlugs: string[] = [];
    if (req.user) {
      const user = await resolveUser(req);
      completedSlugs = await getCompletedLessonSlugs(user._id as Types.ObjectId);
    }
    const result = lessons.map((l) => ({
      ...sanitizeLesson(l),
      isCompleted: completedSlugs.includes(l.lessonId),
    }));
    res.json(result);
  } catch (err) { next(err); }
}

export async function getLesson(req: Request, res: Response, next: NextFunction) {
  try {
    const lessonId = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : req.params.lessonId;
    const lesson = await Lesson.findOne({ lessonId, isActive: true });
    if (!lesson) throw new HttpError(404, 'Lesson not found.');
    let isCompleted = false;
    if (req.user) {
      const user = await resolveUser(req);
      const completed = await getCompletedLessonSlugs(user._id as Types.ObjectId);
      isCompleted = completed.includes(lesson.lessonId);
    }
    res.json({ ...sanitizeLesson(lesson), isCompleted });
  } catch (err) { next(err); }
}

export async function getQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    const lessonId = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : req.params.lessonId;
    const lesson = await Lesson.findOne({ lessonId, isActive: true });
    if (!lesson) throw new HttpError(404, 'Lesson not found.');
    // Return ONLY question + options (no correctAnswerIndex)
    const questions = lesson.quiz.map(({ question, options }) => ({ question, options }));
    res.json(questions);
  } catch (err) { next(err); }
}

export async function submitQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req);
    const lessonId = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : req.params.lessonId;
    const result = await submitQuizSvc(
      user._id as Types.ObjectId,
      lessonId,
      req.body.answers
    );
    res.status(200).json(result);
  } catch (err) { next(err); }
}
