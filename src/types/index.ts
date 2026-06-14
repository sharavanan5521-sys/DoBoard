import type { Timestamp } from 'firebase/firestore'

export interface User {
  uid: string
  name: string
  email: string
  avatarUrl: string | null
  createdAt: Timestamp
}

export interface Board {
  id: string
  name: string
  color: string // hex e.g. "#378ADD"
  members: string[] // array of userIds
  createdBy: string // userId
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type Priority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  boardId: string
  title: string
  description: string | null
  done: boolean
  doneAt: Timestamp | null
  assignee: string | null // userId
  priority: Priority | null
  dueDate: Timestamp | null
  archived: boolean
  createdBy: string // userId
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Presence {
  userId: string
  boardId: string
  lastSeen: Timestamp
}
