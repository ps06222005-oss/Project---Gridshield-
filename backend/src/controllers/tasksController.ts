import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Task } from '../models/Task';
import { completeTask as completeTaskSvc } from '../services/taskService';
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

export async function listTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, difficulty } = req.query as { category?: string; difficulty?: string };
    const filter: Record<string, unknown> = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    const tasks = await Task.find(filter).sort({ category: 1, points: 1 });
    res.json(tasks);
  } catch (err) { next(err); }
}

export async function getTask(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
    const task = await Task.findOne({ taskId, isActive: true });
    if (!task) throw new HttpError(404, 'Task not found.');
    res.json(task);
  } catch (err) { next(err); }
}

export async function completeTask(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUser(req);
    const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
    const result = await completeTaskSvc(
      user._id as Types.ObjectId,
      taskId,
      req.body.verificationNote ?? ''
    );
    res.status(200).json(result);
  } catch (err) { next(err); }
}
