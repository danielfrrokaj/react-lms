import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  VideoLibrary as VideoIcon,
  Info as InfoIcon,
  PictureAsPdf as PdfIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import RichTextEditor from '../../components/common/RichTextEditor';
import Layout from '../../components/common/Layout';
import { getCourseById, addSection, addSubsection, updateSubsection } from '../../services/courseService';
import { getStudentsForCourse } from '../../services/courseService';
import { getUserById } from '../../services/userService';
import { SubsectionType, Task } from '../../types';

// Define allowed section names
const ALLOWED_SECTION_NAMES = ["Lecture", "Tasks", "Additional Info", "Introduction"];

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [openSectionDialog, setOpenSectionDialog] = useState(false);
  const [openSubsectionDialog, setOpenSubsectionDialog] = useState(false);
  const [openStudentsDialog, setOpenStudentsDialog] = useState(false);
  const [newSectionName, setNewSectionName] = useState(ALLOWED_SECTION_NAMES[0]);
  const [newSubsectionName, setNewSubsectionName] = useState('');
  const [newSubsectionType, setNewSubsectionType] = useState<SubsectionType>(SubsectionType.LECTURE);
  const [newSubsectionContent, setNewSubsectionContent] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedSubsection, setSelectedSubsection] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

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
          onClick={() => navigate('/teacher/courses')}
          sx={{ mt: 2 }}
        >
          Back to Courses
        </Button>
      </Layout>
    );
  }

  // Get students enrolled in the course
  const studentIds = getStudentsForCourse(course.id);
  const students = studentIds.map(id => getUserById(id)).filter(Boolean);

  // Handle adding a new section
  const handleAddSection = () => {
    if (newSectionName.trim() && courseId) {
      addSection(courseId, newSectionName.trim());
      setNewSectionName(ALLOWED_SECTION_NAMES[0]);
      setOpenSectionDialog(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check if file is a PDF
      if (file.type !== 'application/pdf') {
        setPdfError('Only PDF files are allowed');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setPdfError('File size should not exceed 5MB');
        return;
      }
      
      setPdfFile(file);
      setPdfError(null);
      
      // Read file as data URL and add to content
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          const pdfEmbed = `
            <div class="pdf-container">
              <p><strong>PDF Attachment:</strong> ${file.name}</p>
              <object data="${e.target.result}" type="application/pdf" width="100%" height="500px">
                <p>Your browser doesn't support embedded PDFs. 
                <a href="${e.target.result}" target="_blank">Click here to download the PDF</a>.</p>
              </object>
            </div>
          `;
          setNewSubsectionContent(prev => prev + pdfEmbed);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle adding a new subsection
  const handleAddSubsection = () => {
    if (newSubsectionName.trim() && selectedSectionId && courseId) {
      // Add task-specific properties if it's a task
      if (newSubsectionType === SubsectionType.TASK) {
        const taskDeadline = document.getElementById('task-deadline') as HTMLInputElement;
        const taskMaxAttempts = document.getElementById('task-max-attempts') as HTMLInputElement;
        
        const deadline = taskDeadline?.value 
          ? new Date(taskDeadline.value).toISOString() 
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Default: 1 week from now
          
        const maxAttempts = taskMaxAttempts?.value 
          ? parseInt(taskMaxAttempts.value, 10) 
          : 2; // Default: 2 attempts
        
        addSubsection(
          selectedSectionId,
          newSubsectionName.trim(),
          newSubsectionType,
          newSubsectionContent || '<p>Complete this task according to the instructions.</p>',
          deadline,
          maxAttempts
        );
      } else {
        // For non-task subsections
        addSubsection(
          selectedSectionId,
          newSubsectionName.trim(),
          newSubsectionType,
          newSubsectionContent || '<p>Content goes here</p>'
        );
      }
      
      setNewSubsectionName('');
      setNewSubsectionType(SubsectionType.LECTURE);
      setNewSubsectionContent('');
      setPdfFile(null);
      setOpenSubsectionDialog(false);
    }
  };

  // Handle updating a subsection
  const handleUpdateSubsection = () => {
    if (selectedSubsection && newSubsectionName.trim()) {
      updateSubsection(selectedSubsection.id, {
        name: newSubsectionName.trim(),
        type: newSubsectionType,
        content: newSubsectionContent,
      });
      setEditMode(false);
      setSelectedSubsection(null);
      setNewSubsectionName('');
      setNewSubsectionType(SubsectionType.LECTURE);
      setNewSubsectionContent('');
      setPdfFile(null);
      setOpenSubsectionDialog(false);
    }
  };

  // Open dialog to add a subsection to a specific section
  const handleOpenSubsectionDialog = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setEditMode(false);
    setNewSubsectionName('');
    setNewSubsectionType(SubsectionType.LECTURE);
    setNewSubsectionContent('');
    setPdfFile(null);
    setOpenSubsectionDialog(true);
  };

  // Open dialog to edit a subsection
  const handleEditSubsection = (subsection: any) => {
    setSelectedSubsection(subsection);
    setEditMode(true);
    setNewSubsectionName(subsection.name);
    setNewSubsectionType(subsection.type);
    setNewSubsectionContent(subsection.content);
    setPdfFile(null);
    setOpenSubsectionDialog(true);
  };

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

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenSectionDialog(true)}
          >
            Add Section
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => setOpenStudentsDialog(true)}
          >
            View Enrolled Students ({students.length})
          </Button>
        </Box>
      </Box>
      
      {/* Course Sections */}
      {course.sections.length > 0 ? (
        course.sections.map((section) => (
          <Accordion key={section.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{section.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenSubsectionDialog(section.id)}
                >
                  Add Subsection
                </Button>
              </Box>
              
              {section.subsections.length > 0 ? (
                <List>
                  {section.subsections.map((subsection) => (
                    <Paper key={subsection.id} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getSubsectionIcon(subsection.type)}
                          <Typography variant="subtitle1">
                            {subsection.name}
                          </Typography>
                        </Box>
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleEditSubsection(subsection)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ mt: 2 }}>
                        <div dangerouslySetInnerHTML={{ __html: subsection.content }} />
                      </Box>
                      {subsection.type === SubsectionType.TASK && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Deadline: {new Date((subsection as Task).deadline).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Max Attempts: {(subsection as Task).maxAttempts}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  No subsections yet. Add one to get started.
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No sections yet. Add a section to get started.
          </Typography>
        </Paper>
      )}
      
      {/* Add Section Dialog */}
      <Dialog open={openSectionDialog} onClose={() => setOpenSectionDialog(false)}>
        <DialogTitle>Add New Section</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="section-name-label">Section Name</InputLabel>
            <Select
              labelId="section-name-label"
              value={newSectionName}
              label="Section Name"
              onChange={(e) => setNewSectionName(e.target.value)}
            >
              {ALLOWED_SECTION_NAMES.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSectionDialog(false)}>Cancel</Button>
          <Button onClick={handleAddSection} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add/Edit Subsection Dialog */}
      <Dialog 
        open={openSubsectionDialog} 
        onClose={() => setOpenSubsectionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editMode ? 'Edit Subsection' : 'Add New Subsection'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Subsection Name"
            fullWidth
            value={newSubsectionName}
            onChange={(e) => setNewSubsectionName(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Subsection Type</InputLabel>
            <Select
              value={newSubsectionType}
              label="Subsection Type"
              onChange={(e) => setNewSubsectionType(e.target.value as SubsectionType)}
            >
              <MenuItem value={SubsectionType.LECTURE}>Lecture</MenuItem>
              <MenuItem value={SubsectionType.LITERATURE}>Literature</MenuItem>
              <MenuItem value={SubsectionType.TASK}>Task</MenuItem>
              <MenuItem value={SubsectionType.EXTRA}>Extra Information</MenuItem>
            </Select>
          </FormControl>
          
          {/* Task-specific fields */}
          {newSubsectionType === SubsectionType.TASK && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Task Settings
              </Typography>
              
              <TextField
                id="task-deadline"
                label="Deadline"
                type="datetime-local"
                defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              <TextField
                id="task-max-attempts"
                label="Maximum Attempts"
                type="number"
                defaultValue={2}
                fullWidth
                inputProps={{ min: 1, max: 10 }}
              />
            </Box>
          )}
          
          {/* PDF Upload */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Attach PDF (Optional)
            </Typography>
            <input
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button
              variant="outlined"
              startIcon={<PdfIcon />}
              onClick={handleUploadClick}
              sx={{ mb: 1 }}
            >
              Upload PDF
            </Button>
            
            {pdfFile && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <PdfIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">{pdfFile.name}</Typography>
              </Box>
            )}
            
            {pdfError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {pdfError}
              </Alert>
            )}
          </Box>
          
          {/* Content editor with different placeholder based on type */}
          <Typography variant="subtitle1" gutterBottom>
            Content
          </Typography>
          <RichTextEditor
            value={newSubsectionContent}
            onChange={setNewSubsectionContent}
            style={{ height: '200px', marginBottom: '50px' }}
            placeholder={
              newSubsectionType === SubsectionType.LECTURE 
                ? "Enter lecture content here..." 
                : newSubsectionType === SubsectionType.LITERATURE 
                  ? "Enter literature references here..." 
                  : newSubsectionType === SubsectionType.TASK 
                    ? "Enter task instructions here..." 
                    : "Enter additional information here..."
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubsectionDialog(false)}>Cancel</Button>
          <Button 
            onClick={editMode ? handleUpdateSubsection : handleAddSubsection} 
            variant="contained" 
            color="primary"
          >
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* View Students Dialog */}
      <Dialog
        open={openStudentsDialog}
        onClose={() => setOpenStudentsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Enrolled Students</DialogTitle>
        <DialogContent>
          {students.length > 0 ? (
            <List>
              {students.map((student) => (
                <ListItem key={student?.id}>
                  <ListItemText
                    primary={student?.name}
                    secondary={student?.email}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="textSecondary">
              No students enrolled in this course.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStudentsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default CourseDetail; 