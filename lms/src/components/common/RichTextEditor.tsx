import React, { useState, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Divider, 
  Paper, 
  IconButton, 
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Link as LinkIcon,
  Image as ImageIcon,
  Title as TitleIcon,
  FormatQuote,
  Code
} from '@mui/icons-material';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  style
}) => {
  const [content, setContent] = useState(value || '');
  const [imageUrl, setImageUrl] = useState('');
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange(newContent);
  };

  const insertTag = (tag: string) => {
    // Get the textarea element
    const textarea = document.getElementById('rich-text-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    // Get selection start and end
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    // Create new content with tags
    const newContent = 
      content.substring(0, start) + 
      `<${tag}>${selectedText}</${tag}>` + 
      content.substring(end);
    
    setContent(newContent);
    onChange(newContent);
    
    // Set focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length + 2, start + tag.length + 2 + selectedText.length);
    }, 0);
  };

  const insertHeading = () => {
    const level = prompt('Enter heading level (1-6):', '2');
    if (!level || isNaN(parseInt(level)) || parseInt(level) < 1 || parseInt(level) > 6) return;
    
    const tag = `h${level}`;
    insertTag(tag);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (!url) return;
    
    const textarea = document.getElementById('rich-text-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || 'Link text';
    
    const newContent = 
      content.substring(0, start) + 
      `<a href="${url}">${selectedText}</a>` + 
      content.substring(end);
    
    setContent(newContent);
    onChange(newContent);
  };

  const handleImageUrlSubmit = () => {
    if (!imageUrl) return;
    
    const textarea = document.getElementById('rich-text-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    
    const imgTag = `<img src="${imageUrl}" alt="Image" style="max-width: 100%;" />`;
    
    const newContent = 
      content.substring(0, start) + 
      imgTag + 
      content.substring(start);
    
    setContent(newContent);
    onChange(newContent);
    setImageUrl('');
    setOpenImageDialog(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        const dataUrl = e.target.result.toString();
        
        const textarea = document.getElementById('rich-text-editor') as HTMLTextAreaElement;
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        
        const imgTag = `<img src="${dataUrl}" alt="${file.name}" style="max-width: 100%;" />`;
        
        const newContent = 
          content.substring(0, start) + 
          imgTag + 
          content.substring(start);
        
        setContent(newContent);
        onChange(newContent);
      }
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <Paper variant="outlined" sx={{ p: 1, ...style }}>
      <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Tooltip title="Bold">
          <Button size="small" onClick={() => insertTag('b')}><FormatBold /></Button>
        </Tooltip>
        <Tooltip title="Italic">
          <Button size="small" onClick={() => insertTag('i')}><FormatItalic /></Button>
        </Tooltip>
        <Tooltip title="Underline">
          <Button size="small" onClick={() => insertTag('u')}><FormatUnderlined /></Button>
        </Tooltip>
        <Tooltip title="Bulleted List">
          <Button size="small" onClick={() => insertTag('ul')}><FormatListBulleted /></Button>
        </Tooltip>
        <Tooltip title="Numbered List">
          <Button size="small" onClick={() => insertTag('ol')}><FormatListNumbered /></Button>
        </Tooltip>
        <Tooltip title="Link">
          <Button size="small" onClick={insertLink}><LinkIcon /></Button>
        </Tooltip>
        <Tooltip title="Heading">
          <Button size="small" onClick={insertHeading}><TitleIcon /></Button>
        </Tooltip>
        <Tooltip title="Quote">
          <Button size="small" onClick={() => insertTag('blockquote')}><FormatQuote /></Button>
        </Tooltip>
        <Tooltip title="Code">
          <Button size="small" onClick={() => insertTag('code')}><Code /></Button>
        </Tooltip>
        <Tooltip title="Image">
          <Button size="small" onClick={() => setOpenImageDialog(true)}><ImageIcon /></Button>
        </Tooltip>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
      </Box>
      <Divider sx={{ mb: 1 }} />
      <TextField
        id="rich-text-editor"
        multiline
        fullWidth
        minRows={8}
        maxRows={20}
        value={content}
        onChange={handleChange}
        placeholder={placeholder}
        variant="outlined"
        InputProps={{
          sx: { fontFamily: 'monospace' }
        }}
      />
      <Box sx={{ mt: 2, p: 2, border: '1px solid #eee', borderRadius: 1, minHeight: '100px', maxHeight: '300px', overflow: 'auto' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Preview:</Typography>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </Box>

      {/* Image Dialog */}
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)}>
        <DialogTitle>Insert Image</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 2 }}>
            <TextField
              label="Image URL"
              fullWidth
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" gutterBottom>Or upload from your device:</Typography>
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              fullWidth
            >
              Choose Image File
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImageDialog(false)}>Cancel</Button>
          <Button onClick={handleImageUrlSubmit} disabled={!imageUrl}>Insert</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default RichTextEditor; 