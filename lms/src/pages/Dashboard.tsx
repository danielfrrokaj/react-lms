import React from 'react';
import { Typography, Grid, Paper, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/common/Layout';
import { UserRole } from '../types';
import AdminDashboard from './admin/Dashboard';
import TeacherDashboard from './teacher/Dashboard';
import StudentDashboard from './student/Dashboard';

const Dashboard: React.FC = () => {
  const { userRole, currentUser } = useAuth();

  // Render different dashboard based on user role
  const renderDashboard = () => {
    switch (userRole) {
      case UserRole.ADMIN:
        return <AdminDashboard />;
      case UserRole.TEACHER:
        return <TeacherDashboard />;
      case UserRole.STUDENT:
        return <StudentDashboard />;
      default:
        return (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="error">
              Invalid user role
            </Typography>
          </Paper>
        );
    }
  };

  return (
    <Layout title="Dashboard">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {currentUser?.name}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {userRole === UserRole.ADMIN && 'Administrator Dashboard'}
          {userRole === UserRole.TEACHER && 'Teacher Dashboard'}
          {userRole === UserRole.STUDENT && 'Student Dashboard'}
        </Typography>
      </Box>
      
      {renderDashboard()}
    </Layout>
  );
};

export default Dashboard; 