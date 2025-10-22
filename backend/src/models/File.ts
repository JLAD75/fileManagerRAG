import mongoose, { Document, Schema } from 'mongoose'

export interface IFile extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  originalName: string
  size: number
  mimeType: string
  path: string
  isProcessed: boolean
  uploadedAt: Date
}

const fileSchema = new Schema<IFile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  isProcessed: {
    type: Boolean,
    default: false,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
})

export const File = mongoose.model<IFile>('File', fileSchema)
