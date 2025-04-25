import mongoose, { Document, Schema } from 'mongoose';

export type NotificationStatus = 'unread' | 'read';

export type NotificationType = 'info' | 'warning' | 'announcement';

export type NotificationTargetType = 'all' | 'age-group' | 'individual';

export interface INotification extends Document {
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  targetType: NotificationTargetType;
  targetAgeGroup?: '5-8' | '9-12' | '13-18'; // required if targetType is 'age-group'
  recipient?: mongoose.Types.ObjectId;       // required if targetType is 'individual'
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    status: {
      type: String,
      enum: ['unread', 'read'],
      default: 'unread',
    },
    targetType: {
      type: String,
      enum: ['all', 'age-group', 'individual'],
      required: true,
    },
    targetAgeGroup: {
      type: String,
      enum: ['5-8', '9-12', '13-18'],
      required: function () {
        return this.targetType === 'age-group';
      },
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return this.targetType === 'individual';
      },
    },
  },
  {
    timestamps: true,
  }
);


const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
 
export default Notification;