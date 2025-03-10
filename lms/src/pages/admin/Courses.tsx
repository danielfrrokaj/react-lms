import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  ListItemText,
  Checkbox,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import Layout from '../../components/common/Layout';
import { getAllCourses } from '../../services/courseService';
import { getAllTeachers, getAllStudents, addTeacherToCourse, addStudentToCourse } from '../../services/userService';
import { v4 as uuidv4 } from 'uuid';
import { Course, Teacher, Student } from '../../types';
import { mockCourses } from '../../services/mockData';

const Courses: React.FC = () => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [assignType, setAssignType] = useState<'teachers' | 'students'>('teachers');

  // Get all courses, teachers, and students
  const courses = getAllCourses();
  const teachers = getAllTeachers();
  const students = getAllStudents();

  // Handle adding a new course
  const handleAddCourse = () => {
    if (courseName.trim() && courseDescription.trim()) {
      const newCourse: Course = {
        id: uuidv4(),
        name: courseName.trim(),
        description: courseDescription.trim(),
        teachers: [],
        students: [],
        sections: [],
      };
      
      mockCourses.push(newCourse);
      
      setCourseName('');
      setCourseDescription('');
      setOpenAddDialog(false);
    }
  };

  // Handle editing a course
  const handleEditCourse = () => {
    if (selectedCourse && courseName.trim() && courseDescription.trim()) {
      selectedCourse.name = courseName.trim();
      selectedCourse.description = courseDescription.trim();
      
      setCourseName('');
      setCourseDescription('');
      setSelectedCourse(null);
      setOpenEditDialog(false);
    }
  };

  // Open edit dialog for a course
  const handleOpenEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setCourseName(course.name);
    setCourseDescription(course.description);
    setOpenEditDialog(true);
  };

  // Open assign dialog for a course
  const handleOpenAssignDialog = (course: Course, type: 'teachers' | 'students') => {
    setSelectedCourse(course);
    setAssignType(type);
    setSelectedTeachers(type === 'teachers' ? [...course.teachers] : []);
    setSelectedStudents(type === 'students' ? [...course.students] : []);
    setOpenAssignDialog(true);
  };

  // Handle teacher selection change
  const handleTeacherChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedTeachers(typeof value === 'string' ? value.split(',') : value);
  };

  // Handle student selection change
  const handleStudentChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedStudents(typeof value === 'string' ? value.split(',') : value);
  };

  // Handle assigning teachers or students to a course
  const handleAssign = () => {
    if (!selectedCourse) return;
    
    if (assignType === 'teachers') {
      // Clear existing teachers
      selectedCourse.teachers = [];
      
      // Add selected teachers
      selectedTeachers.forEach(teacherId => {
        addTeacherToCourse(teacherId, selectedCourse.id);
      });
    } else {
      // Clear existing students
      selectedCourse.students = [];
      
      // Add selected students
      selectedStudents.forEach(studentId => {
        addStudentToCourse(studentId, selectedCourse.id);
      });
    }
    
    setSelectedCourse(null);
    setSelectedTeachers([]);
    setSelectedStudents([]);
    setOpenAssignDialog(false);
  };

  return (
    <Layout title="Manage Courses">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Courses</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Course
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Teachers</TableCell>
              <TableCell>Students</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.description}</TableCell>
                <TableCell>
                  <Chip
                    label={`${course.teachers.length} Teachers`}
                    color="primary"
                    onClick={() => handleOpenAssignDialog(course, 'teachers')}
                    clickable
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${course.students.length} Students`}
                    color="secondary"
                    onClick={() => handleOpenAssignDialog(course, 'students')}
                    clickable
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleOpenEditDialog(course)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Add Course Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Course</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Course Name"
            fullWidth
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Course Description"
            fullWidth
            multiline
            rows={4}
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCourse} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Course Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Course</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Course Name"
            fullWidth
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Course Description"
            fullWidth
            multiline
            rows={4}
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditCourse} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Assign Teachers/Students Dialog */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)}>
        <DialogTitle>
          {assignType === 'teachers' ? 'Assign Teachers' : 'Assign Students'} to Course
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            {selectedCourse?.name}
          </Typography>
          
          {assignType === 'teachers' ? (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Teachers</InputLabel>
              <Select
                multiple
                value={selectedTeachers}
                onChange={handleTeacherChange}
                renderValue={(selected) => {
                  const selectedTeacherNames = selected.map(id => {
                    const teacher = teachers.find(t => t.id === id);
                    return teacher ? teacher.name : '';
                  }).join(', ');
                  return selectedTeacherNames || 'No teachers selected';
                }}
              >
                {teachers.map((teacher: Teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id}>
                    <Checkbox checked={selectedTeachers.indexOf(teacher.id) > -1} />
                    <ListItemText primary={teacher.name} secondary={teacher.email} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Students</InputLabel>
              <Select
                multiple
                value={selectedStudents}
                onChange={handleStudentChange}
                renderValue={(selected) => {
                  const selectedStudentNames = selected.map(id => {
                    const student = students.find(s => s.id === id);
                    return student ? student.name : '';
                  }).join(', ');
                  return selectedStudentNames || 'No students selected';
                }}
              >
                {students.map((student: Student) => (
                  <MenuItem key={student.id} value={student.id}>
                    <Checkbox checked={selectedStudents.indexOf(student.id) > -1} />
                    <ListItemText primary={student.name} secondary={student.email} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained" color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Courses; 