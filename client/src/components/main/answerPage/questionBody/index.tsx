import './index.css';
import { Box, Chip, Typography, Tooltip } from '@mui/material';
import { handleHyperlink } from '../../../../tool';

interface QuestionBodyProps {
  views: number;
  text: string;
  askby: string;
  askbyRank?: string;
  meta: string;
}

const QuestionBody = ({ views, text, askby, askbyRank, meta }: QuestionBodyProps) => (
  <div id='questionBody' className='questionBody right_padding'>
    <div className='bold_title answer_question_view'>{views} views</div>
    <div className='answer_question_text'>{handleHyperlink(text)}</div>
    <div className='answer_question_right'>
      <Box display='flex' alignItems='center' gap={1}>
        <Typography className='question_author' fontWeight={500} color='text.primary'>
          {askby}
        </Typography>
        {askbyRank && (
          <Tooltip title='User Rank' arrow>
            <Chip
              label={askbyRank}
              size='small'
              variant='outlined'
              color='primary'
              sx={{ fontSize: '0.7rem', fontWeight: 500 }}
            />
          </Tooltip>
        )}
      </Box>
      <div className='answer_question_meta'>asked {meta}</div>
    </div>
  </div>
);

export default QuestionBody;
