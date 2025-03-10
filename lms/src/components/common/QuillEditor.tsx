import React, { useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  modules?: any;
}

const QuillEditor: React.FC<QuillEditorProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  style,
  modules 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorValue, setEditorValue] = useState(value);

  // Handle changes from the editor
  const handleChange = (content: string) => {
    setEditorValue(content);
    onChange(content);
  };

  // Set up default modules if not provided
  const defaultModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div ref={editorRef} className="quill-editor-container">
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        placeholder={placeholder}
        style={style || { height: '200px', marginBottom: '50px' }}
        modules={modules || defaultModules}
      />
    </div>
  );
};

export default QuillEditor; 