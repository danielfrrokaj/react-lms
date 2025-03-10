# University Learning Management System (LMS)

A React-based Learning Management System for universities, supporting three user roles: Admin, Teacher, and Student.

## Features

### Admin Features
- Manage courses (create, edit, delete)
- Manage users (create, assign roles)
- Assign teachers to courses
- Enroll students in courses

### Teacher Features
- View assigned courses
- Create and manage course sections
- Add various types of content (lectures, literature, tasks, extra information)
- Grade student submissions
- View enrolled students

### Student Features
- View enrolled courses
- Access course materials (lectures, literature, etc.)
- Submit assignments
- Track progress and deadlines
- View grades and feedback

## Technology Stack

- React 19
- TypeScript
- React Router v7
- Material UI
- React Quill (rich text editor)

## Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/         # React contexts (auth, etc.)
├── pages/            # Page components
│   ├── admin/        # Admin-specific pages
│   ├── auth/         # Authentication pages
│   ├── student/      # Student-specific pages
│   └── teacher/      # Teacher-specific pages
├── services/         # Service functions for data handling
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/university-lms.git
cd university-lms
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Demo Accounts

For demonstration purposes, the following accounts are available:

- Admin: admin@university.edu (any password)
- Teacher: teacher1@university.edu (any password)
- Student: student1@university.edu (any password)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
