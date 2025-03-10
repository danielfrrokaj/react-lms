import { Grade, Task } from '../types';
import { mockGrades } from './mockData';
import { v4 as uuidv4 } from 'uuid';

// Get grades for a student
export const getGradesForStudent = (studentId: string): Grade[] => {
  return mockGrades.filter(grade => grade.studentId === studentId);
};

// Get grades for a task
export const getGradesForTask = (taskId: string): Grade[] => {
  return mockGrades.filter(grade => grade.taskId === taskId);
};

// Get grade for a specific student and task
export const getGradeForStudentTask = (studentId: string, taskId: string): Grade | undefined => {
  return mockGrades.find(grade => grade.studentId === studentId && grade.taskId === taskId);
};

// Submit a grade for a student's task
export const submitGrade = (
  taskId: string,
  studentId: string,
  passed: boolean,
  feedback?: string
): Grade => {
  // Check if a grade already exists for this student and task
  const existingGrade = getGradeForStudentTask(studentId, taskId);
  
  if (existingGrade) {
    // Update the existing grade
    existingGrade.passed = passed;
    existingGrade.attempts += 1;
    if (feedback) {
      existingGrade.feedback = feedback;
    }
    return existingGrade;
  } else {
    // Create a new grade
    const newGrade: Grade = {
      taskId,
      studentId,
      passed,
      attempts: 1,
      feedback,
    };
    
    mockGrades.push(newGrade);
    return newGrade;
  }
};

// Check if a student can attempt a task
export const canAttemptTask = (studentId: string, task: Task): boolean => {
  const grade = getGradeForStudentTask(studentId, task.id);
  
  // If no grade exists or the student hasn't passed yet and has attempts remaining
  if (!grade) {
    return true;
  }
  
  return !grade.passed && grade.attempts < task.maxAttempts;
};

// Get remaining attempts for a student on a task
export const getRemainingAttempts = (studentId: string, task: Task): number => {
  const grade = getGradeForStudentTask(studentId, task.id);
  
  if (!grade) {
    return task.maxAttempts;
  }
  
  return Math.max(0, task.maxAttempts - grade.attempts);
}; 