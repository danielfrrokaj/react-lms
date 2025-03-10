import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { UserRole } from '../../types';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  const from = locationState?.from?.pathname || '/dashboard';

  const handleRoleChange = (event: SelectChangeEvent) => {
    setSelectedRole(event.target.value as UserRole);
    
    // Set default email based on selected role
    switch (event.target.value) {
      case UserRole.ADMIN:
        setEmail('admin@university.edu');
        break;
      case UserRole.TEACHER:
        setEmail('teacher1@university.edu');
        break;
      case UserRole.STUDENT:
        setEmail('student1@university.edu');
        break;
      default:
        setEmail('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      // In a real app, we would validate the email and password
      // For this demo, we'll just check if the email is in our mock data
      const success = await login(email, password);
      
      if (success) {
        navigate(from);
      } else {
        setError('Failed to log in. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred during login.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          University LMS
        </Typography>
        <Typography variant="h5" component="h2" align="center" gutterBottom>
          Log In
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-select-label">Select Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={selectedRole}
              label="Select Role"
              onChange={handleRoleChange}
              required
            >
              <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
              <MenuItem value={UserRole.TEACHER}>Teacher</MenuItem>
              <MenuItem value={UserRole.STUDENT}>Student</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            helperText="Any password will work for this demo"
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" align="center" color="textSecondary">
            This is a demo application. Select a role to pre-fill the email field.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 