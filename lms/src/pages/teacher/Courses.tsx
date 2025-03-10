import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  CalendarToday as CalendarTodayIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { getCoursesForUser } from '../../services/courseService';
import { UserRole } from '../../types';
import { getUserById } from '../../services/userService';
import { getTasksForCourse } from '../../services/mockData';

const Courses: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [openStudentsDialog, setOpenStudentsDialog] = useState(false);
  const [openTasksDialog, setOpenTasksDialog] = useState(false);
  
  // Get courses for the current teacher
  const courses = currentUser ? getCoursesForUser(currentUser.id, UserRole.TEACHER) : [];

  // Handle opening the students dialog
  const handleOpenStudentsDialog = (course: any) => {
    setSelectedCourse(course);
    setOpenStudentsDialog(true);
  };

  // Handle opening the tasks dialog
  const handleOpenTasksDialog = (course: any) => {
    setSelectedCourse(course);
    setOpenTasksDialog(true);
  };

  // Handle navigating to course detail
  const handleViewCourse = (courseId: string) => {
    navigate(`/teacher/courses/${courseId}`);
  };

  // Get course statistics
  const getCourseStats = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return { students: 0, sections: 0, subsections: 0, tasks: 0 };
    
    const students = course.students.length;
    const sections = course.sections.length;
    const subsections = course.sections.reduce((total, section) => total + section.subsections.length, 0);
    const tasks = getTasksForCourse(courseId).length;
    
    return { students, sections, subsections, tasks };
  };

  return (
    <Layout title="My Courses">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Courses
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Courses you are assigned to teach
        </Typography>
      </Box>
      
      {courses.length > 0 ? (
        <Grid container spacing={3}>
          {courses.map((course) => {
            const stats = getCourseStats(course.id);
            
            return (
              <Grid item xs={12} md={6} key={course.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {course.name}
                      </Typography>
                      <Chip 
                        icon={<SchoolIcon />} 
                        label="Teacher" 
                        color="primary" 
                        size="small" 
                      />
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {course.description}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6">{stats.students}</Typography>
                          <Typography variant="body2" color="textSecondary">Students</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6">{stats.sections}</Typography>
                          <Typography variant="body2" color="textSecondary">Sections</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6">{stats.subsections}</Typography>
                          <Typography variant="body2" color="textSecondary">Subsections</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6">{stats.tasks}</Typography>
                          <Typography variant="body2" color="textSecondary">Tasks</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                      {course.teachers.length > 1 && (
                        <Chip
                          icon={<PeopleIcon />}
                          label={`${course.teachers.length} Teachers`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      <Chip
                        icon={<AssignmentIcon />}
                        label={`${stats.tasks} Tasks`}
                        size="small"
                        variant="outlined"
                        color={stats.tasks > 0 ? 'primary' : 'default'}
                      />
                    </Box>
                  </CardContent>
                  
                  <Divider />
                  
                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Box>
                      <Tooltip title="View Students">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenStudentsDialog(course)}
                        >
                          <PeopleIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Tasks">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenTasksDialog(course)}
                        >
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => handleViewCourse(course.id)}
                    >
                      Manage Course
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            You are not assigned to any courses yet.
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Contact an administrator to be assigned to courses.
          </Typography>
        </Paper>
      )}
      
      {/* Students Dialog */}
      <Dialog
        open={openStudentsDialog}
        onClose={() => setOpenStudentsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon color="primary" />
            Students Enrolled
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCourse && (
            <>
              <DialogContentText>
                Students enrolled in {selectedCourse.name}
              </DialogContentText>
              
              {selectedCourse.students.length > 0 ? (
                <List>
                  {selectedCourse.students.map((studentId: string) => {
                    const student = getUserById(studentId);
                    return (
                      <ListItem key={studentId}>
                        <ListItemAvatar>
                          <Avatar>
                            {student?.name.charAt(0) || '?'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={student?.name || 'Unknown Student'}
                          secondary={student?.email || ''}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body1" color="textSecondary">
                    No students enrolled in this course.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStudentsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Tasks Dialog */}
      <Dialog
        open={openTasksDialog}
        onClose={() => setOpenTasksDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon color="primary" />
            Course Tasks
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCourse && (
            <>
              <DialogContentText>
                Tasks in {selectedCourse.name}
              </DialogContentText>
              
              {(() => {
                const tasks = getTasksForCourse(selectedCourse.id);
                
                if (tasks.length > 0) {
                  return (
                    <List>
                      {tasks.map((task) => (
                        <ListItem key={task.id}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'warning.main' }}>
                              <AssignmentIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={task.name}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="textPrimary">
                                  Due: {new Date(task.deadline).toLocaleDateString()}
                                </Typography>
                                {` — Max Attempts: ${task.maxAttempts}`}
                              </>
                            }
                          />
                          <Tooltip title="View Task">
                            <IconButton 
                              edge="end" 
                              onClick={() => {
                                setOpenTasksDialog(false);
                                handleViewCourse(selectedCourse.id);
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItem>
                      ))}
                    </List>
                  );
                } else {
                  return (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body1" color="textSecondary">
                        No tasks created for this course.
                      </Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => {
                          setOpenTasksDialog(false);
                          handleViewCourse(selectedCourse.id);
                        }}
                      >
                        Create Tasks
                      </Button>
                    </Box>
                  );
                }
              })()}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTasksDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Courses; 