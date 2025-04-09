import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface AskCommunityQuestionProps {
  communityID: string;
}

const AskCommunityQuestion = ({ communityID }: AskCommunityQuestionProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/new/question/${communityID}`);
  };

  return (
    <Button variant='contained' color='primary' onClick={handleClick} sx={{ mr: 2 }}>
      Ask Question
    </Button>
  );
};

export default AskCommunityQuestion;
