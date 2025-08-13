export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  userId: string;
  comments: Comment[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}