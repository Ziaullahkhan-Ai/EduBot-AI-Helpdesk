
import { FAQ, Conversation, QueryCategory, Sentiment } from '../types';

const STORAGE_KEYS = {
  FAQS: 'edubot_faqs',
  CONVERSATIONS: 'edubot_conversations',
};

const INITIAL_FAQS: FAQ[] = [
  { id: '1', question: 'How do I apply for admission?', answer: 'You can apply through our online portal at admissions.university.edu.', category: QueryCategory.ADMISSIONS },
  { id: '2', question: 'What is the fee for Computer Science?', answer: 'The annual fee for CS is $5,000 per year.', category: QueryCategory.FEES },
  { id: '3', question: 'When are the mid-term exams?', answer: 'Mid-term exams usually start in the second week of October.', category: QueryCategory.EXAMS },
];

export const db = {
  getFAQs: (): FAQ[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FAQS);
    return data ? JSON.parse(data) : INITIAL_FAQS;
  },
  saveFAQs: (faqs: FAQ[]) => {
    localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(faqs));
  },
  getConversations: (): Conversation[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return data ? JSON.parse(data) : [];
  },
  saveConversation: (conv: Conversation) => {
    const conversations = db.getConversations();
    const index = conversations.findIndex(c => c.id === conv.id);
    if (index >= 0) {
      conversations[index] = conv;
    } else {
      conversations.unshift(conv);
    }
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  },
  deleteConversation: (id: string) => {
    const conversations = db.getConversations().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  }
};
