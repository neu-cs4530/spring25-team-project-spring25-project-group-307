export interface Community {
  _id: string;
  title: string;
  description: string;
  isPrivate?: boolean;
  admins: string[];
  moderators: string[];
  members: string[];
  questions: string[];
  pinnedQuestions: string[];
  tags: string[];
}
