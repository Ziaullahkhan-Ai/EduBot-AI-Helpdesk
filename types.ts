
export enum QueryCategory {
  ADMISSIONS = 'Admissions',
  ACADEMICS = 'Academics',
  FEES = 'Fees & Finance',
  EXAMS = 'Exams',
  SYLLABUS = 'Syllabus',
  TECHNICAL = 'Technical Support',
  OTHER = 'Other'
}

export enum Sentiment {
  POSITIVE = 'Positive',
  NEUTRAL = 'Neutral',
  NEGATIVE = 'Negative'
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: QueryCategory;
}

export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  studentId: string;
  studentName: string;
  messages: Message[];
  category: QueryCategory;
  sentiment: Sentiment;
  platform: 'Web' | 'WhatsApp' | 'Facebook';
  lastActivity: number;
  status: 'Open' | 'Resolved' | 'Escalated';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
}

export interface AnalyticsData {
  totalQueries: number;
  resolvedRate: number;
  categoryDistribution: { name: string; value: number }[];
  sentimentDistribution: { name: string; value: number }[];
  platformDistribution: { name: string; value: number }[];
  queriesPerDay: { date: string; count: number }[];
}
