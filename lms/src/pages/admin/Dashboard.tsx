import React from 'react';
import { Typography, Grid, Paper, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { School as SchoolIcon, Person as PersonIcon } from '@mui/icons-material';
import { getAllCourses } from '../../services/courseService';
import { getAllTeachers, getAllStudents } from '../../services/userService';

const AdminDashboard: React.FC = () => {
  const courses = getAllCourses();
  const teachers = getAllTeachers();
  const students = getAllStudents();

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
              Total Courses
            </Typography>
            <Typography variant="h3">{courses.length}</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/admin/courses"
            startIcon={<SchoolIcon />}
          >
            Manage Courses
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
              Total Teachers
            </Typography>
            <Typography variant="h3">{teachers.length}</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/admin/users"
            startIcon={<PersonIcon />}
          >
            Manage Users
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
              Total Students
            </Typography>
            <Typography variant="h3">{students.length}</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/admin/users"
            startIcon={<PersonIcon />}
          >
            Manage Users
          </Button>
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

export default AdminDashboard; 