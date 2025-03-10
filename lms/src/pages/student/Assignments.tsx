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
  Chip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { getCoursesForUser } from '../../services/courseService';
import { UserRole } from '../../types';
import { getTasksForStudent } from '../../services/mockData';
import { canAttemptTask, getGradeForStudentTask, getRemainingAttempts, submitGrade } from '../../services/gradeService';

const Assignments: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [taskSubmission, setTaskSubmission] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Get courses for the current student
  const courses = currentUser ? getCoursesForUser(currentUser.id, UserRole.STUDENT) : [];
  
  // Get tasks for the student
  const tasks = currentUser ? getTasksForStudent(currentUser.id) : [];
  
  // Get course names for tasks
  const tasksWithCourseNames = tasks.map(task => {
    const course = courses.find(c => c.id === task.courseId);
    return {
      ...task,
      courseName: course ? course.name : 'Unknown Course',
    };
  });
  
  // Filter tasks based on tab
  const upcomingTasks = tasksWithCourseNames
    .filter(task => {
      if (!currentUser) return false;
      const grade = getGradeForStudentTask(currentUser.id, task.id);
      return !grade || !grade.passed;
    })
    .filter(task => new Date(task.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  
  const completedTasks = tasksWithCourseNames
    .filter(task => {
      if (!currentUser) return false;
      const grade = getGradeForStudentTask(currentUser.id, task.id);
      return grade && grade.passed;
    })
    .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
  
  const pastDueTasks = tasksWithCourseNames
    .filter(task => {
      if (!currentUser) return false;
      const grade = getGradeForStudentTask(currentUser.id, task.id);
      return (!grade || !grade.passed) && new Date(task.deadline) <= new Date();
    })
    .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle opening the task submission dialog
  const handleOpenTaskDialog = (task: any) => {
    setSelectedTask(task);
    setTaskSubmission('');
    setOpenTaskDialog(true);
  };

  // Handle submitting a task
  const handleSubmitTask = () => {
    if (!selectedTask || !currentUser || !taskSubmission.trim()) return;
    
    setSubmitting(true);
    
    // In a real app, this would send the submission to the server
    // For this demo, we'll just randomly determine if the submission passes
    const passed = Math.random() > 0.5;
    
    // Submit the grade
    submitGrade(
      selectedTask.id,
      currentUser.id,
      passed,
      passed ? 'Good job!' : 'Please try again.'
    );
    
    setSubmitting(false);
    setOpenTaskDialog(false);
  };

  // Render task list based on current tab
  const renderTaskList = () => {
    let currentTasks: any[] = [];
    
    switch (tabValue) {
      case 0:
        currentTasks = upcomingTasks;
        break;
      case 1:
        currentTasks = completedTasks;
        break;
      case 2:
        currentTasks = pastDueTasks;
        break;
      default:
        currentTasks = upcomingTasks;
    }
    
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
          const grade = currentUser ? getGradeForStudentTask(currentUser.id, task.id) : undefined;
          const canAttempt = currentUser ? canAttemptTask(currentUser.id, task) : false;
          const remainingAttempts = currentUser ? getRemainingAttempts(currentUser.id, task) : 0;
          const daysUntilDeadline = Math.ceil(
            (new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          
          return (
            <React.Fragment key={task.id}>
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  tabValue === 0 && canAttempt ? (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleOpenTaskDialog(task)}
                    >
                      Attempt ({remainingAttempts} left)
                    </Button>
                  ) : tabValue === 1 ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Completed"
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Chip
                      icon={<CancelIcon />}
                      label={canAttempt ? `${remainingAttempts} attempts left` : "No attempts left"}
                      color={canAttempt ? "warning" : "error"}
                      size="small"
                    />
                  )
                }
              >
                <ListItemText
                  primary={task.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="textPrimary">
                        {task.courseName}
                      </Typography>
                      {` — Due: ${new Date(task.deadline).toLocaleDateString()}`}
                      {tabValue === 0 && daysUntilDeadline <= 3 && (
                        <Chip
                          label={`${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''} left`}
                          color="error"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                      {grade && (
                        <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                          Feedback: {grade.feedback || 'No feedback provided.'}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
              {index < currentTasks.length - 1 && <Divider />}
            </React.Fragment>
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
          View and complete your assignments
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
          <Tab label={`Completed (${completedTasks.length})`} />
          <Tab label={`Past Due (${pastDueTasks.length})`} />
        </Tabs>
      </Box>
      
      <Paper>
        {renderTaskList()}
      </Paper>
      
      {/* Task Submission Dialog */}
      <Dialog
        open={openTaskDialog}
        onClose={() => setOpenTaskDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{selectedTask?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <div dangerouslySetInnerHTML={{ __html: selectedTask?.content || '' }} />
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            Your Submission
          </Typography>
          <TextField
            multiline
            rows={6}
            fullWidth
            placeholder="Enter your answer here..."
            value={taskSubmission}
            onChange={(e) => setTaskSubmission(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitTask}
            variant="contained"
            color="primary"
            disabled={submitting || !taskSubmission.trim()}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Assignments; 