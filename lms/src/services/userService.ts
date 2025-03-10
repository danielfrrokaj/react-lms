import { Admin, Student, Teacher, User, UserRole } from '../types';
import { getAdmin, getStudents, getTeachers, mockCourses, mockUsers } from './mockData';
import { v4 as uuidv4 } from 'uuid';

// Get all users
export const getAllUsers = (): User[] => {
  return [...mockUsers];
};

// Get user by ID
export const getUserById = (userId: string): User | undefined => {
  return mockUsers.find(user => user.id === userId);
};

// Get user by email
export const getUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(user => user.email === email);
};

// Get all teachers
export const getAllTeachers = (): Teacher[] => {
  return getTeachers();
};

// Get all students
export const getAllStudents = (): Student[] => {
  return getStudents();
};

// Get admin
export const getAdminUser = (): Admin | undefined => {
  return getAdmin();
};

// Add a teacher to a course
export const addTeacherToCourse = (teacherId: string, courseId: string): boolean => {
  const course = mockCourses.find(c => c.id === courseId);
  if (!course) {
    return false;
  }

  // Check if teacher is already assigned to the course
  if (course.teachers.includes(teacherId)) {
    return true;
  }

  // Add teacher to course
  course.teachers.push(teacherId);
  return true;
};

// Remove a teacher from a course
export const removeTeacherFromCourse = (teacherId: string, courseId: string): boolean => {
  const course = mockCourses.find(c => c.id === courseId);
  if (!course) {
    return false;
  }

  // Check if teacher is assigned to the course
  const index = course.teachers.indexOf(teacherId);
  if (index === -1) {
    return false;
  }

  // Remove teacher from course
  course.teachers.splice(index, 1);
  return true;
};

// Add a student to a course
export const addStudentToCourse = (studentId: string, courseId: string): boolean => {
  const course = mockCourses.find(c => c.id === courseId);
  if (!course) {
    return false;
  }

  // Check if student is already enrolled in the course
  if (course.students.includes(studentId)) {
    return true;
  }

  // Add student to course
  course.students.push(studentId);
  return true;
};

// Remove a student from a course
export const removeStudentFromCourse = (studentId: string, courseId: string): boolean => {
  const course = mockCourses.find(c => c.id === courseId);
  if (!course) {
    return false;
  }

  // Check if student is enrolled in the course
  const index = course.students.indexOf(studentId);
  if (index === -1) {
    return false;
  }

  // Remove student from course
  course.students.splice(index, 1);
  return true;
};

// Create a new user
export const createUser = (
  name: string,
  email: string,
  role: UserRole
): User => {
  // Check if email already exists
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    throw new Error(`User with email ${email} already exists`);
  }

  // Create new user
  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    role,
  };

  // Add user to mock data
  mockUsers.push(newUser);

  return newUser;
}; 