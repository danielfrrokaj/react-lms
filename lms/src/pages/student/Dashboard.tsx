import React from 'react';
import { Typography, Grid, Paper, Box, Button, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { School as SchoolIcon, Assignment as AssignmentIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getCoursesForUser } from '../../services/courseService';
import { UserRole } from '../../types';
import { getTasksForStudent } from '../../services/mockData';
import { getGradeForStudentTask } from '../../services/gradeService';

const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Get courses for the current student
  const courses = currentUser ? getCoursesForUser(currentUser.id, UserRole.STUDENT) : [];
  
  // Get tasks for the student
  const tasks = currentUser ? getTasksForStudent(currentUser.id) : [];
  
  // Filter for upcoming tasks (deadline in the future)
  const upcomingTasks = tasks
    .filter(task => new Date(task.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  
  // Get completed tasks
  const completedTasks = tasks.filter(task => {
    if (!currentUser) return false;
    const grade = getGradeForStudentTask(currentUser.id, task.id);
    return grade && grade.passed;
  });

  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12} md={4}>
        <Paper
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            height: 200,
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="h6" gutterBottom>
              My Courses
            </Typography>
            <Typography variant="h3">{courses.length}</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/student/courses"
            startIcon={<SchoolIcon />}
          >
            View Courses
          </Button>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Paper
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            height: 200,
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="h6" gutterBottom>
              Upcoming Tasks
            </Typography>
            <Typography variant="h3">{upcomingTasks.length}</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/student/assignments"
            startIcon={<AssignmentIcon />}
          >
            View Tasks
          </Button>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Paper
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            height: 200,
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="h6" gutterBottom>
              Completed Tasks
            </Typography>
            <Typography variant="h3">{completedTasks.length}</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/student/assignments"
            startIcon={<AssignmentIcon />}
          >
            View All
          </Button>
        </Paper>
      </Grid>
      
      {/* Upcoming Deadlines */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Upcoming Deadlines
          </Typography>
          
          {upcomingTasks.length > 0 ? (
            <List>
              {upcomingTasks.slice(0, 5).map((task, index) => {
                const course = courses.find(c => c.id === task.courseId);
                const daysUntilDeadline = Math.ceil(
                  (new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <React.Fragment key={task.id}>
                    <ListItem
                      secondaryAction={
                        <Chip
                          label={`${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''} left`}
                          color={daysUntilDeadline <= 3 ? 'error' : 'primary'}
                          size="small"
                        />
                      }
                    >
                      <ListItemText
                        primary={task.name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              {course?.name}
                            </Typography>
                            {` — Due: ${new Date(task.deadline).toLocaleDateString()}`}
                          </>
                        }
                      />
                    </ListItem>
                    {index < upcomingTasks.slice(0, 5).length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          ) : (
            <Typography variant="body1" color="textSecondary">
              No upcoming deadlines.
            </Typography>
          )}
        </Paper>
      </Grid>
      
      {/* Recent Activity */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Typography variant="body1" color="textSecondary">
            No recent activity to display.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default StudentDashboard; 