/**
 * UserSettings.ts — Per-user preferences.
 * One document per user (userId is unique).
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUserSettings extends Document {
  userId: Types.ObjectId;
  notificationEnabled: boolean;
  dailyGoalPoints: number;
  timezone: string;
  updatedAt: Date;
}

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    notificationEnabled: { type: Boolean, default: true },
    dailyGoalPoints: {
      type: Number,
      default: 50,
      enum: [25, 50, 75, 100],
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
      trim: true,
      maxlength: 50,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

export const UserSettings = mongoose.model<IUserSettings>(
  'UserSettings',
  UserSettingsSchema
);
