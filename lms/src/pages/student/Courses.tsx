import React from 'react';
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
  LinearProgress,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { getCoursesForUser } from '../../services/courseService';
import { UserRole } from '../../types';
import { getTasksForCourse } from '../../services/mockData';
import { getGradeForStudentTask } from '../../services/gradeService';

const Courses: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Get courses for the current student
  const courses = currentUser ? getCoursesForUser(currentUser.id, UserRole.STUDENT) : [];

  // Calculate progress for each course
  const courseProgress = courses.map(course => {
    const tasks = getTasksForCourse(course.id);
    
    if (tasks.length === 0) {
      return { ...course, progress: 0, completedTasks: 0, totalTasks: 0 };
    }
    
    let completedTasks = 0;
    
    if (currentUser) {
      tasks.forEach(task => {
        const grade = getGradeForStudentTask(currentUser.id, task.id);
        if (grade && grade.passed) {
          completedTasks++;
        }
      });
    }
    
    const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    
    return {
      ...course,
      progress,
      completedTasks,
      totalTasks: tasks.length,
    };
  });

  return (
    <Layout title="My Courses">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Courses
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Courses you are enrolled in
        </Typography>
      </Box>
      
      {courseProgress.length > 0 ? (
        <Grid container spacing={3}>
          {courseProgress.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {course.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {course.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Progress</Typography>
                      <Typography variant="body2">{Math.round(course.progress)}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={course.progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<SchoolIcon />}
                      label={`${course.sections.length} Sections`}
                      size="small"
                    />
                    <Chip
                      icon={<AssignmentIcon />}
                      label={`${course.completedTasks}/${course.totalTasks} Tasks`}
                      size="small"
                      color={course.completedTasks === course.totalTasks && course.totalTasks > 0 ? 'success' : 'default'}
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate(`/student/courses/${course.id}`)}
                  >
                    View Course
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            You are not enrolled in any courses yet.
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Contact an administrator to be enrolled in courses.
          </Typography>
        </Box>
      )}
    </Layout>
  );
};

export default Courses; 