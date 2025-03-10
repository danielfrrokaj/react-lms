import React from 'react';
import { Typography, Grid, Paper, Box, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { School as SchoolIcon, Assignment as AssignmentIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getCoursesForUser } from '../../services/courseService';
import { UserRole } from '../../types';
import { getTasksForCourse } from '../../services/mockData';

const TeacherDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Get courses for the current teacher
  const courses = currentUser ? getCoursesForUser(currentUser.id, UserRole.TEACHER) : [];
  
  // Get upcoming tasks/deadlines
  const upcomingTasks = courses.flatMap(course => {
    const tasks = getTasksForCourse(course.id);
    return tasks.map(task => ({
      ...task,
      courseName: course.name,
    }));
  }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12} md={6}>
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
            to="/teacher/courses"
            startIcon={<SchoolIcon />}
          >
            View Courses
          </Button>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
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
              Active Tasks
            </Typography>
            <Typography variant="h3">{upcomingTasks.length}</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/teacher/assignments"
            startIcon={<AssignmentIcon />}
          >
            View Tasks
          </Button>
        </Paper>
      </Grid>
      
      {/* Upcoming Deadlines */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Upcoming Task Deadlines
          </Typography>
          
          {upcomingTasks.length > 0 ? (
            <List>
              {upcomingTasks.slice(0, 5).map((task, index) => (
                <React.Fragment key={task.id}>
                  <ListItem>
                    <ListItemText
                      primary={task.name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="textPrimary">
                            {task.courseName}
                          </Typography>
                          {` — Due: ${new Date(task.deadline).toLocaleDateString()}`}
                        </>
                      }
                    />
                  </ListItem>
                  {index < upcomingTasks.slice(0, 5).length - 1 && <Divider />}
                </React.Fragment>
              ))}
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

export default TeacherDashboard; 