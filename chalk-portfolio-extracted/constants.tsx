
import React from 'react';
import { Student, Session, TutorProfile } from './types';

export const MOCK_TUTOR: TutorProfile = {
  name: "Dr. Alexander Chen",
  slug: "alex-chen",
  title: "Elite SAT/ACT Strategist",
  bio: "Stanford Alum with 10+ years of experience helping students reach the 99th percentile. Specialized in Math and Science sections.",
  subjects: ["SAT Math", "ACT Science", "Calculus BC"],
  stats: {
    totalSessions: 1420,
    longTermRate: "88%",
    avgResponseTime: "< 15 mins"
  }
};

export const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'James W.', subject: 'SAT Math', status: 'active', lastSession: '2023-10-24' },
  { id: '2', name: 'Sarah K.', subject: 'ACT Reading', status: 'active', lastSession: '2023-10-23' },
  { id: '3', name: 'Emily R.', subject: 'Calculus BC', status: 'completed', lastSession: '2023-09-12' },
];

export const MOCK_SESSIONS: Session[] = [
  { id: 's1', studentName: 'James W.', date: '2023-10-24', duration: 90, topic: 'Quadratic Functions', platform: 'Zoom' },
  { id: 's2', studentName: 'Sarah K.', date: '2023-10-23', duration: 60, topic: 'Reading Strategy', platform: 'Zoom' },
  { id: 's3', studentName: 'David L.', date: '2023-10-22', duration: 120, topic: 'Full Practice Test Review', platform: 'Zoom' },
];

export const CHART_DATA = [
  { name: 'Mon', hours: 4 },
  { name: 'Tue', hours: 6.5 },
  { name: 'Wed', hours: 3 },
  { name: 'Thu', hours: 8 },
  { name: 'Fri', hours: 5 },
  { name: 'Sat', hours: 10 },
  { name: 'Sun', hours: 2 },
];

export const Badges = {
  QuickResponse: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-500">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Consistent: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-500">
      <path d="M12 20V10M18 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Detailed: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
};
