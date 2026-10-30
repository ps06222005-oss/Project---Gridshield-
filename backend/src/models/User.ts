/**
 * User.ts — Mongoose model for registered users.
 *
 * firebaseUid is the stable identity key linked to Firebase Auth.
 * Points are stored here for fast leaderboard queries, but the
 * authoritative source of truth is the PointsLedger collection.
 */
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  name: string;
  location: string;
  timezone: string;           // IANA timezone string e.g. "Asia/Kolkata"
  points: number;
  streakDays: number;
  lastActiveDate: string;      // User-timezone date string "YYYY-MM-DD"
  co2AvoidedKg: number;
  energySavedKwh: number;
  waterConservedL: number;
  plasticBottlesAvoided: number;
  treesPlanted: number;
  notificationEnabled: boolean;
  dailyGoalPoints: number;
  hasOnboarded: boolean;
  isDemo: boolean;             // true for seeded demo/placeholder accounts
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    timezone: {
      type: String,
      trim: true,
      maxlength: 50,
      default: 'Asia/Kolkata',
    },
    points: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    streakDays: { type: Number, default: 0, min: 0 },
    lastActiveDate: { type: String, default: '' }, // "YYYY-MM-DD" UTC
    co2AvoidedKg: { type: Number, default: 0, min: 0 },
    energySavedKwh: { type: Number, default: 0, min: 0 },
    waterConservedL: { type: Number, default: 0, min: 0 },
    plasticBottlesAvoided: { type: Number, default: 0, min: 0 },
    treesPlanted: { type: Number, default: 0, min: 0 },
    notificationEnabled: { type: Boolean, default: true },
    dailyGoalPoints: {
      type: Number,
      default: 50,
      enum: [25, 50, 75, 100],
    },
    hasOnboarded: { type: Boolean, default: false },
    isDemo: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for leaderboard queries (points descending, real users only)
UserSchema.index({ points: -1, isDemo: 1 });
UserSchema.index({ location: 1, points: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);
