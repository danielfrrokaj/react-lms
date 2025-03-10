import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  VideoLibrary as VideoIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarTodayIcon,
  Repeat as RepeatIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import Layout from '../../components/common/Layout';
import { getCourseById } from '../../services/courseService';
import { useAuth } from '../../contexts/AuthContext';
import { SubsectionType, Task } from '../../types';
import { canAttemptTask, getGradeForStudentTask, getRemainingAttempts, submitGrade } from '../../services/gradeService';

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskSubmission, setTaskSubmission] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get course data
  const course = courseId ? getCourseById(courseId) : undefined;
  
  if (!course) {
    return (
      <Layout title="Course Not Found">
        <Typography variant="h5" color="error">
          Course not found
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/student/courses')}
          sx={{ mt: 2 }}
        >
          Back to Courses
        </Button>
      </Layout>
    );
  }

  // Check if the current user is enrolled in this course
  const isEnrolled = currentUser && course.students.includes(currentUser.id);
  
  if (!isEnrolled) {
    return (
      <Layout title="Not Enrolled">
        <Typography variant="h5" color="error">
          You are not enrolled in this course
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/student/courses')}
          sx={{ mt: 2 }}
        >
          Back to Courses
        </Button>
      </Layout>
    );
  }

  // Get icon for subsection type
  const getSubsectionIcon = (type: SubsectionType) => {
    switch (type) {
      case SubsectionType.LECTURE:
        return <VideoIcon />;
      case SubsectionType.LITERATURE:
        return <BookIcon />;
      case SubsectionType.TASK:
        return <AssignmentIcon />;
      case SubsectionType.EXTRA:
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  // Handle opening the task submission dialog
  const handleOpenTaskDialog = (task: Task) => {
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

  // Check if a task is completed
  const isTaskCompleted = (taskId: string): boolean => {
    if (!currentUser) return false;
    const grade = getGradeForStudentTask(currentUser.id, taskId);
    return grade ? grade.passed : false;
  };

  return (
    <Layout title={course.name}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {course.name}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          {course.description}
        </Typography>
      </Box>
      
      {/* Course Sections */}
      {course.sections.length > 0 ? (
        course.sections.map((section) => (
          <Accordion key={section.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{section.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {section.subsections.length > 0 ? (
                section.subsections.map((subsection) => {
                  const isTask = subsection.type === SubsectionType.TASK;
                  const task = isTask ? subsection as Task : null;
                  const isCompleted = isTask && isTaskCompleted(subsection.id);
                  const canAttempt = isTask && currentUser ? canAttemptTask(currentUser.id, task as Task) : false;
                  const remainingAttempts = isTask && currentUser ? getRemainingAttempts(currentUser.id, task as Task) : 0;
                  
                  return (
                    <Paper key={subsection.id} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getSubsectionIcon(subsection.type)}
                          <Typography variant="subtitle1">
                            {subsection.name}
                          </Typography>
                          {isTask && (
                            <Chip
                              icon={isCompleted ? <CheckCircleIcon /> : <CancelIcon />}
                              label={isCompleted ? 'Completed' : 'Incomplete'}
                              color={isCompleted ? 'success' : 'error'}
                              size="small"
                            />
                          )}
                          <Chip
                            label={
                              subsection.type === SubsectionType.LECTURE ? 'Lecture' :
                              subsection.type === SubsectionType.LITERATURE ? 'Literature' :
                              subsection.type === SubsectionType.TASK ? 'Task' : 'Extra'
                            }
                            size="small"
                            color={
                              subsection.type === SubsectionType.LECTURE ? 'primary' :
                              subsection.type === SubsectionType.LITERATURE ? 'secondary' :
                              subsection.type === SubsectionType.TASK ? 'warning' : 'default'
                            }
                          />
                        </Box>
                        {isTask && !isCompleted && canAttempt && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleOpenTaskDialog(task as Task)}
                          >
                            Attempt Task ({remainingAttempts} left)
                          </Button>
                        )}
                        {isTask && !isCompleted && !canAttempt && (
                          <Chip
                            label="No attempts left"
                            color="warning"
                            size="small"
                          />
                        )}
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ mt: 2 }}>
                        {subsection.type === SubsectionType.LECTURE && (
                          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <VideoIcon color="primary" />
                            <Typography variant="subtitle2" color="primary">
                              Lecture Content
                            </Typography>
                          </Box>
                        )}
                        
                        {subsection.type === SubsectionType.LITERATURE && (
                          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BookIcon color="secondary" />
                            <Typography variant="subtitle2" color="secondary">
                              Required Reading
                            </Typography>
                          </Box>
                        )}
                        
                        {subsection.type === SubsectionType.EXTRA && (
                          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InfoIcon />
                            <Typography variant="subtitle2">
                              Additional Information
                            </Typography>
                          </Box>
                        )}
                        
                        {subsection.type === SubsectionType.TASK && (
                          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AssignmentIcon color="warning" />
                            <Typography variant="subtitle2" color="warning.main">
                              Task Instructions
                            </Typography>
                          </Box>
                        )}
                        
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            bgcolor: 'background.default',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <div dangerouslySetInnerHTML={{ __html: subsection.content }} />
                        </Paper>
                      </Box>
                      
                      {isTask && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Deadline: {new Date(task!.deadline).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Max Attempts: {task!.maxAttempts}
                          </Typography>
                          
                          {currentUser && (
                            <Box sx={{ mt: 1 }}>
                              {isCompleted ? (
                                <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                  Status: Passed
                                </Typography>
                              ) : (
                                <Typography variant="body2" sx={{ color: 'error.main' }}>
                                  Status: {canAttempt ? 'Not Completed' : 'Failed'}
                                </Typography>
                              )}
                              
                              {currentUser && (
                                <Box sx={{ mt: 1 }}>
                                  {(() => {
                                    const grade = getGradeForStudentTask(currentUser.id, subsection.id);
                                    if (grade && grade.feedback) {
                                      return (
                                        <Paper sx={{ p: 1, bgcolor: 'background.default', borderLeft: '4px solid', borderColor: grade.passed ? 'success.main' : 'error.main' }}>
                                          <Typography variant="subtitle2">Feedback:</Typography>
                                          <Typography variant="body2">{grade.feedback}</Typography>
                                        </Paper>
                                      );
                                    }
                                    return null;
                                  })()}
                                </Box>
                              )}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Paper>
                  );
                })
              ) : (
                <Typography variant="body1" color="textSecondary">
                  No content available for this section.
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No content available for this course yet.
          </Typography>
        </Paper>
      )}
      
      {/* Task Submission Dialog */}
      <Dialog
        open={openTaskDialog}
        onClose={() => setOpenTaskDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon color="warning" />
            {selectedTask?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Task information */}
          <Box sx={{ mb: 3 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'background.default',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: selectedTask?.content || '' }} />
            </Paper>
          </Box>
          
          {/* Task metadata */}
          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Chip 
              icon={<CalendarTodayIcon />} 
              label={`Deadline: ${selectedTask ? new Date(selectedTask.deadline).toLocaleDateString() : 'N/A'}`} 
              color="primary"
              variant="outlined"
            />
            
            {currentUser && selectedTask && (
              <Chip 
                icon={<RepeatIcon />} 
                label={`Attempts: ${
                  getGradeForStudentTask(currentUser.id, selectedTask.id)?.attempts || 0
                }/${selectedTask.maxAttempts}`} 
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
          
          {/* Submission form */}
          <Typography variant="h6" gutterBottom>
            Your Submission
          </Typography>
          <TextField
            multiline
            rows={6}
            fullWidth
            placeholder="Enter your answer here..."
            value={taskSubmission}
            onChange={(e) => setTaskSubmission(e.target.value)}
            variant="outlined"
            InputProps={{
              sx: { fontFamily: 'monospace' }
            }}
          />
          
          {/* Submission guidelines */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 1 }}>
            <Typography variant="subtitle2">
              Submission Guidelines:
            </Typography>
            <Typography variant="body2">
              • Be clear and concise in your answers<br />
              • Make sure to address all parts of the task<br />
              • Check your work before submitting<br />
              • You have {currentUser && selectedTask ? getRemainingAttempts(currentUser.id, selectedTask) : 0} attempts remaining
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitTask}
            variant="contained"
            color="primary"
            disabled={submitting || !taskSubmission.trim()}
            startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default CourseDetail; 