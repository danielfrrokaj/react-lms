import { Admin, Course, Grade, Section, Student, Subsection, SubsectionType, Task, Teacher, User, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@university.edu',
    role: UserRole.ADMIN,
  },
  {
    id: '2',
    name: 'Teacher One',
    email: 'teacher1@university.edu',
    role: UserRole.TEACHER,
  },
  {
    id: '3',
    name: 'Teacher Two',
    email: 'teacher2@university.edu',
    role: UserRole.TEACHER,
  },
  {
    id: '4',
    name: 'Student One',
    email: 'student1@university.edu',
    role: UserRole.STUDENT,
  },
  {
    id: '5',
    name: 'Student Two',
    email: 'student2@university.edu',
    role: UserRole.STUDENT,
  },
  {
    id: '6',
    name: 'Student Three',
    email: 'student3@university.edu',
    role: UserRole.STUDENT,
  },
];

// Mock Courses
export const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Introduction to Computer Science',
    description: 'A foundational course covering basic computer science concepts.',
    teachers: ['2'],
    students: ['4', '5'],
    sections: [],
  },
  {
    id: '2',
    name: 'Advanced Mathematics',
    description: 'An in-depth exploration of advanced mathematical concepts.',
    teachers: ['2', '3'],
    students: ['4', '6'],
    sections: [],
  },
  {
    id: '3',
    name: 'Physics 101',
    description: 'An introduction to basic physics principles and theories.',
    teachers: ['3'],
    students: ['5', '6'],
    sections: [],
  },
];

// Mock Sections
export const mockSections: Section[] = [
  {
    id: '1',
    name: 'Week 1: Introduction',
    courseId: '1',
    subsections: [],
  },
  {
    id: '2',
    name: 'Week 2: Basic Algorithms',
    courseId: '1',
    subsections: [],
  },
  {
    id: '3',
    name: 'Week 1: Fundamentals',
    courseId: '2',
    subsections: [],
  },
  {
    id: '4',
    name: 'Week 1: Mechanics',
    courseId: '3',
    subsections: [],
  },
];

// Mock Subsections
export const mockSubsections: Subsection[] = [
  {
    id: '1',
    name: 'Lecture: Course Overview',
    type: SubsectionType.LECTURE,
    content: '<h1>Welcome to Computer Science</h1><p>This course will cover the fundamentals of computer science...</p>',
    sectionId: '1',
    courseId: '1',
  },
  {
    id: '2',
    name: 'Literature: Introduction to Algorithms',
    type: SubsectionType.LITERATURE,
    content: '<h2>Required Reading</h2><ul><li>Chapter 1 of Introduction to Algorithms</li><li>Article on Big O Notation</li></ul>',
    sectionId: '1',
    courseId: '1',
  },
  {
    id: '3',
    name: 'Task: Algorithm Quiz',
    type: SubsectionType.TASK,
    content: '<h2>Quiz Instructions</h2><p>Complete the quiz on basic algorithm concepts.</p>',
    sectionId: '2',
    courseId: '1',
  } as Task,
  {
    id: '4',
    name: 'Lecture: Mathematics Fundamentals',
    type: SubsectionType.LECTURE,
    content: '<h1>Mathematics Fundamentals</h1><p>This lecture covers the basic principles of advanced mathematics...</p>',
    sectionId: '3',
    courseId: '2',
  },
  {
    id: '5',
    name: 'Task: Mathematics Problem Set',
    type: SubsectionType.TASK,
    content: '<h2>Problem Set</h2><p>Complete the following problems...</p>',
    sectionId: '3',
    courseId: '2',
  } as Task,
];

// Add task-specific properties to task subsections
(mockSubsections[2] as Task).deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 1 week from now
(mockSubsections[2] as Task).maxAttempts = 2;
(mockSubsections[4] as Task).deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 2 weeks from now
(mockSubsections[4] as Task).maxAttempts = 3;

// Connect sections to courses
mockCourses.forEach(course => {
  course.sections = mockSections.filter(section => section.courseId === course.id);
});

// Connect subsections to sections
mockSections.forEach(section => {
  section.subsections = mockSubsections.filter(subsection => subsection.sectionId === section.id);
});

// Mock Grades
export const mockGrades: Grade[] = [
  {
    taskId: '3',
    studentId: '4',
    passed: true,
    attempts: 1,
    feedback: 'Excellent work!',
  },
  {
    taskId: '3',
    studentId: '5',
    passed: false,
    attempts: 1,
    feedback: 'Please review the material and try again.',
  },
  {
    taskId: '5',
    studentId: '4',
    passed: true,
    attempts: 2,
    feedback: 'Good job on the second attempt.',
  },
];

// Helper function to get teachers with their courses
export const getTeachers = (): Teacher[] => {
  return mockUsers
    .filter(user => user.role === UserRole.TEACHER)
    .map(user => ({
      ...user,
      role: UserRole.TEACHER,
      courses: mockCourses
        .filter(course => course.teachers.includes(user.id))
        .map(course => course.id),
    }));
};

// Helper function to get students with their courses and grades
export const getStudents = (): Student[] => {
  return mockUsers
    .filter(user => user.role === UserRole.STUDENT)
    .map(user => {
      const studentGrades: Record<string, Grade> = {};
      mockGrades
        .filter(grade => grade.studentId === user.id)
        .forEach(grade => {
          studentGrades[grade.taskId] = grade;
        });

      return {
        ...user,
        role: UserRole.STUDENT,
        courses: mockCourses
          .filter(course => course.students.includes(user.id))
          .map(course => course.id),
        grades: studentGrades,
      };
    });
};

// Helper function to get admin
export const getAdmin = (): Admin | undefined => {
  const admin = mockUsers.find(user => user.role === UserRole.ADMIN);
  if (admin) {
    return {
      ...admin,
      role: UserRole.ADMIN,
    };
  }
  return undefined;
};

// Helper function to get tasks for a student
export const getTasksForStudent = (studentId: string): Task[] => {
  const student = getStudents().find(s => s.id === studentId);
  if (!student) return [];

  const tasks: Task[] = [];
  student.courses.forEach(courseId => {
    const course = mockCourses.find(c => c.id === courseId);
    if (course) {
      course.sections.forEach(section => {
        section.subsections
          .filter(subsection => subsection.type === SubsectionType.TASK)
          .forEach(subsection => {
            tasks.push(subsection as Task);
          });
      });
    }
  });

  return tasks;
};

// Helper function to get tasks for a course
export const getTasksForCourse = (courseId: string): Task[] => {
  const course = mockCourses.find(c => c.id === courseId);
  if (!course) return [];

  const tasks: Task[] = [];
  course.sections.forEach(section => {
    section.subsections
      .filter(subsection => subsection.type === SubsectionType.TASK)
      .forEach(subsection => {
        tasks.push(subsection as Task);
      });
  });

  return tasks;
}; 