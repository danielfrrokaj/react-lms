import { Course, Section, Subsection, SubsectionType, Task, UserRole } from '../types';
import { mockCourses, mockSections, mockSubsections } from './mockData';
import { v4 as uuidv4 } from 'uuid';

// Get all courses
export const getAllCourses = (): Course[] => {
  return [...mockCourses];
};

// Get course by ID
export const getCourseById = (courseId: string): Course | undefined => {
  return mockCourses.find(course => course.id === courseId);
};

// Get courses for a user
export const getCoursesForUser = (userId: string, role: UserRole): Course[] => {
  if (role === UserRole.ADMIN) {
    return getAllCourses();
  }

  return mockCourses.filter(course => {
    if (role === UserRole.TEACHER) {
      return course.teachers.includes(userId);
    } else if (role === UserRole.STUDENT) {
      return course.students.includes(userId);
    }
    return false;
  });
};

// Get sections for a course
export const getSectionsForCourse = (courseId: string): Section[] => {
  return mockSections.filter(section => section.courseId === courseId);
};

// Get subsections for a section
export const getSubsectionsForSection = (sectionId: string): Subsection[] => {
  return mockSubsections.filter(subsection => subsection.sectionId === sectionId);
};

// Add a new section to a course
export const addSection = (courseId: string, sectionName: string): Section => {
  const newSection: Section = {
    id: uuidv4(),
    name: sectionName,
    courseId,
    subsections: [],
  };

  mockSections.push(newSection);
  
  // Update the course's sections
  const course = getCourseById(courseId);
  if (course) {
    course.sections.push(newSection);
  }

  return newSection;
};

// Add a new subsection to a section
export const addSubsection = (
  sectionId: string,
  subsectionName: string,
  type: SubsectionType,
  content: string,
  deadline?: string,
  maxAttempts?: number
): Subsection => {
  const section = mockSections.find(s => s.id === sectionId);
  if (!section) {
    throw new Error(`Section with ID ${sectionId} not found`);
  }

  const newSubsection: Subsection = {
    id: uuidv4(),
    name: subsectionName,
    type,
    content,
    sectionId,
    courseId: section.courseId,
  };

  // If it's a task, add task-specific properties
  if (type === SubsectionType.TASK) {
    (newSubsection as Task).deadline = deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Default: 1 week from now
    (newSubsection as Task).maxAttempts = maxAttempts || 2; // Default: 2 attempts
  }

  mockSubsections.push(newSubsection);
  
  // Update the section's subsections
  section.subsections.push(newSubsection);

  return newSubsection;
};

// Update a subsection
export const updateSubsection = (
  subsectionId: string,
  updates: Partial<Subsection>
): Subsection => {
  const subsection = mockSubsections.find(s => s.id === subsectionId);
  if (!subsection) {
    throw new Error(`Subsection with ID ${subsectionId} not found`);
  }

  // Update the subsection
  Object.assign(subsection, updates);

  return subsection;
};

// Update a task
export const updateTask = (
  taskId: string,
  updates: Partial<Task>
): Task => {
  const task = mockSubsections.find(s => s.id === taskId && s.type === SubsectionType.TASK) as Task;
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  // Update the task
  Object.assign(task, updates);

  return task;
};

// Get students enrolled in a course
export const getStudentsForCourse = (courseId: string): string[] => {
  const course = getCourseById(courseId);
  return course ? course.students : [];
};

// Get teachers assigned to a course
export const getTeachersForCourse = (courseId: string): string[] => {
  const course = getCourseById(courseId);
  return course ? course.teachers : [];
}; 