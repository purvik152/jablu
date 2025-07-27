import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user: Schema.Types.ObjectId; // The user who receives the notification
  message: string;
  link: string; // URL to navigate to when clicked
  isRead: boolean;
}

const NotificationSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  link: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);