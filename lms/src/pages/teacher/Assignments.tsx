import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { getCoursesForUser } from '../../services/courseService';
import { UserRole } from '../../types';
import { getTasksForCourse } from '../../services/mockData';
import { getGradesForTask, submitGrade } from '../../services/gradeService';
import { getUserById } from '../../services/userService';

const Assignments: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [openGradeDialog, setOpenGradeDialog] = useState(false);
  const [openTaskDetailsDialog, setOpenTaskDetailsDialog] = useState(false);
  const [passed, setPassed] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  // Get courses for the current teacher
  const courses = currentUser ? getCoursesForUser(currentUser.id, UserRole.TEACHER) : [];
  
  // Get all tasks from all courses
  const allTasks = courses.flatMap(course => {
    const tasks = getTasksForCourse(course.id);
    return tasks.map(task => ({
      ...task,
      courseName: course.name,
      courseId: course.id,
    }));
  });
  
  // Filter tasks based on tab
  const upcomingTasks = allTasks
    .filter(task => new Date(task.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  
  const pastTasks = allTasks
    .filter(task => new Date(task.deadline) <= new Date())
    .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle opening the grade dialog
  const handleOpenGradeDialog = (task: any, student: any) => {
    setSelectedTask(task);
    setSelectedStudent(student);
    
    // Get existing grade if available
    const existingGrade = getGradesForTask(task.id).find(grade => grade.studentId === student.id);
    
    setPassed(existingGrade ? existingGrade.passed : false);
    setFeedback(existingGrade ? existingGrade.feedback || '' : '');
    
    setOpenGradeDialog(true);
  };

  // Handle submitting a grade
  const handleSubmitGrade = () => {
    if (!selectedTask || !selectedStudent) return;
    
    submitGrade(
      selectedTask.id,
      selectedStudent.id,
      passed,
      feedback
    );
    
    setOpenGradeDialog(false);
  };

  // Handle opening task details dialog
  const handleOpenTaskDetails = (task: any) => {
    setSelectedTask(task);
    setOpenTaskDetailsDialog(true);
  };

  // Handle navigating to course detail
  const handleGoToCourse = (courseId: string) => {
    navigate(`/teacher/courses/${courseId}`);
  };

  // Get task statistics
  const getTaskStats = (taskId: string) => {
    const grades = getGradesForTask(taskId);
    const totalSubmissions = grades.length;
    const passedSubmissions = grades.filter(grade => grade.passed).length;
    const pendingSubmissions = grades.filter(grade => !grade.passed).length;
    
    return { totalSubmissions, passedSubmissions, pendingSubmissions };
  };

  // Render task list based on current tab
  const renderTaskList = () => {
    const currentTasks = tabValue === 0 ? upcomingTasks : pastTasks;
    
    if (currentTasks.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No tasks to display.
          </Typography>
        </Paper>
      );
    }
    
    return (
      <List>
        {currentTasks.map((task, index) => {
          const stats = getTaskStats(task.id);
          const daysUntilDeadline = Math.ceil(
            (new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 1000 * 24)
          );
          
          return (
            <Paper key={task.id} sx={{ mb: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">{task.name}</Typography>
                  <Chip 
                    label={task.courseName} 
                    size="small" 
                    icon={<SchoolIcon />} 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit' }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarTodayIcon color="action" />
                      <Typography variant="body2">
                        Due: {new Date(task.deadline).toLocaleDateString()}
                        {tabValue === 0 && daysUntilDeadline <= 3 && (
                          <Chip
                            label={`${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''} left`}
                            color="error"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssignmentIcon color="action" />
                      <Typography variant="body2">
                        Max Attempts: {task.maxAttempts}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon color="action" />
                      <Typography variant="body2">
                        Submissions: {stats.totalSubmissions}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={`Passed: ${stats.passedSubmissions}`}
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    icon={<CancelIcon />}
                    label={`Pending: ${stats.pendingSubmissions}`}
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Tooltip title="View Task Details">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenTaskDetails(task)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Task">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleGoToCourse(task.courseId)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleOpenTaskDetails(task)}
                  >
                    View Submissions
                  </Button>
                </Box>
              </Box>
            </Paper>
          );
        })}
      </List>
    );
  };

  return (
    <Layout title="Assignments">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Assignments
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Manage and grade student submissions
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={`Upcoming (${upcomingTasks.length})`} />
          <Tab label={`Past (${pastTasks.length})`} />
        </Tabs>
      </Box>
      
      {renderTaskList()}
      
      {/* Grade Dialog */}
      <Dialog
        open={openGradeDialog}
        onClose={() => setOpenGradeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon color="primary" />
            Grade Submission
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTask && selectedStudent && (
            <>
              <DialogContentText>
                Grading {selectedStudent.name}'s submission for {selectedTask.name}
              </DialogContentText>
              
              <Box sx={{ my: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={passed}
                      onChange={(e) => setPassed(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={passed ? 'Passed' : 'Failed'}
                />
              </Box>
              
              <TextField
                label="Feedback"
                multiline
                rows={4}
                fullWidth
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback to the student..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGradeDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitGrade}
            variant="contained"
            color="primary"
          >
            Submit Grade
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Task Details Dialog */}
      <Dialog
        open={openTaskDetailsDialog}
        onClose={() => setOpenTaskDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon color="primary" />
            {selectedTask?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Task Details
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <div dangerouslySetInnerHTML={{ __html: selectedTask.content }} />
                </Paper>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Student Submissions
              </Typography>
              
              {(() => {
                if (!selectedTask) return null;
                
                const grades = getGradesForTask(selectedTask.id);
                const course = courses.find(c => c.id === selectedTask.courseId);
                
                if (!course) return null;
                
                if (grades.length === 0) {
                  return (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body1" color="textSecondary">
                        No submissions yet.
                      </Typography>
                    </Box>
                  );
                }
                
                return (
                  <List>
                    {grades.map((grade) => {
                      const student = getUserById(grade.studentId);
                      
                      return (
                        <ListItem key={grade.studentId} divider>
                          <ListItemAvatar>
                            <Avatar>
                              {student?.name.charAt(0) || '?'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={student?.name || 'Unknown Student'}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="textPrimary">
                                  Attempts: {grade.attempts}/{selectedTask.maxAttempts}
                                </Typography>
                                {grade.feedback && (
                                  <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                                    Feedback: {grade.feedback}
                                  </Typography>
                                )}
                              </>
                            }
                          />
                          <Chip
                            icon={grade.passed ? <CheckCircleIcon /> : <CancelIcon />}
                            label={grade.passed ? 'Passed' : 'Failed'}
                            color={grade.passed ? 'success' : 'error'}
                            sx={{ mr: 1 }}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setOpenTaskDetailsDialog(false);
                              handleOpenGradeDialog(selectedTask, student);
                            }}
                          >
                            {grade.passed ? 'Update Grade' : 'Grade'}
                          </Button>
                        </ListItem>
                      );
                    })}
                  </List>
                );
              })()}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Assignments; 