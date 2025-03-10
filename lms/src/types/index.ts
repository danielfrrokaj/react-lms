export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export enum SubsectionType {
  LECTURE = 'lecture',
  LITERATURE = 'literature',
  TASK = 'task',
  EXTRA = 'extra',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Admin extends User {
  role: UserRole.ADMIN;
}

export interface Teacher extends User {
  role: UserRole.TEACHER;
  courses: string[]; // Course IDs
}

export interface Student extends User {
  role: UserRole.STUDENT;
  courses: string[]; // Course IDs
  grades: Record<string, Grade>; // Task ID -> Grade
}

export interface Course {
  id: string;
  name: string;
  description: string;
  teachers: string[]; // Teacher IDs
  students: string[]; // Student IDs
  sections: Section[];
}

export interface Section {
  id: string;
  name: string;
  courseId: string;
  subsections: Subsection[];
}

export interface Subsection {
  id: string;
  name: string;
  type: SubsectionType;
  content: string; // HTML content from rich text editor
  sectionId: string;
  courseId: string;
}

export interface Task extends Subsection {
  type: SubsectionType.TASK;
  deadline: string; // ISO date string
  maxAttempts: number;
}

export interface Grade {
  taskId: string;
  studentId: string;
  passed: boolean;
  attempts: number;
  feedback?: string;
} 