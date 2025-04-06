import React, { ReactNode } from 'react';
import './index.css';
import { Card } from '@mui/material';

/**
 * Interface representing the props for the Form component.
 *
 * - children - The React nodes (elements) to be rendered inside the form container.
 */
interface FormProps {
  children: ReactNode;
}

/**
 * Form component that renders a container for form elements.
 * It wraps its children with a div styled as a form container.
 *
 * @param children The React nodes to be displayed inside the form container.
 */
const Form: React.FC<FormProps> = ({ children }) => (
  <Card
    sx={{
      p: 2,
      width: '60%',
      minWidth: '350px',
      m: '20px auto',
      borderRadius: '10px',
      boxShadow: 2,
      backgroundColor: '#FDFBF7',
    }}>
    {children}
  </Card>
);

export default Form;
