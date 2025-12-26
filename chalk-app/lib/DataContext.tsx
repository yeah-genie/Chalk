import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface Student {
    id: string;
    name: string;
    subject?: string;
}

export interface ScheduledLesson {
    id: string;
    studentId: string;
    studentName: string;
    day: number; // 0-6
    time: string;
    duration: number;
    subject?: string;
    recurring: boolean;
    homeworkDue?: string; // New: Expected homework
}

export interface LessonLog {
    id: string;
    studentId: string;
    studentName: string;
    date: string; // YYYY-MM-DD
    time: string;
    topic: string;
    rating: 'good' | 'okay' | 'struggled';
    struggles: string[];
    notes?: string;
    homeworkAssigned?: string; // New: Homework assigned during this lesson
    homeworkCompleted?: boolean; // New: Was previous homework done?
    aiInsights?: string;
}

// Active Session Type
export interface ActiveSession {
    studentId: string;
    studentName: string;
    startTime: number;
}

interface DataContextType {
    isLoading: boolean;
    students: Student[];
    addStudent: (student: Omit<Student, 'id'>) => Student;
    removeStudent: (id: string) => void;
    updateStudent: (id: string, updates: Partial<Student>) => void;

    scheduledLessons: ScheduledLesson[];
    addScheduledLesson: (lesson: Omit<ScheduledLesson, 'id'>) => void;
    updateScheduledLesson: (id: string, updates: Partial<ScheduledLesson>) => void;
    removeScheduledLesson: (id: string) => void;

    lessonLogs: LessonLog[];
    addLessonLog: (log: Omit<LessonLog, 'id'>) => void;
    removeLessonLog: (id: string) => void;
    getLogsForStudent: (studentId: string) => LessonLog[];
    getLogsForDate: (date: string) => LessonLog[];

    activeSession: ActiveSession | null;
    startSession: (studentId: string, studentName: string) => void;
    endSession: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

const STORAGE_KEYS = {
    STUDENTS: '@chalk_students',
    SCHEDULED: '@chalk_scheduled',
    LOGS: '@chalk_logs',
    ACTIVE_SESSION: '@chalk_active_session',
};

// Default data for first launch
const DEFAULT_STUDENTS: Student[] = [
    { id: '1', name: 'Alex Kim', subject: 'Math' },
    { id: '2', name: 'Sarah Lee', subject: 'English' },
];

export function DataProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);
    const [scheduledLessons, setScheduledLessons] = useState<ScheduledLesson[]>([]);
    const [lessonLogs, setLessonLogs] = useState<LessonLog[]>([]);
    const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    // Save data whenever it changes
    useEffect(() => {
        if (!isLoading) {
            saveData();
        }
    }, [students, scheduledLessons, lessonLogs, activeSession, isLoading]);

    const loadData = async () => {
        try {
            const [studentsJson, scheduledJson, logsJson, activeSessionJson] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.STUDENTS),
                AsyncStorage.getItem(STORAGE_KEYS.SCHEDULED),
                AsyncStorage.getItem(STORAGE_KEYS.LOGS),
                AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION),
            ]);

            setStudents(studentsJson ? JSON.parse(studentsJson) : DEFAULT_STUDENTS);
            setScheduledLessons(scheduledJson ? JSON.parse(scheduledJson) : []);
            setLessonLogs(logsJson ? JSON.parse(logsJson) : []);
            setActiveSession(activeSessionJson ? JSON.parse(activeSessionJson) : null);
        } catch (error) {
            console.error('Error loading data:', error);
            setStudents(DEFAULT_STUDENTS);
        } finally {
            setIsLoading(false);
        }
    };

    const saveData = async () => {
        try {
            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students)),
                AsyncStorage.setItem(STORAGE_KEYS.SCHEDULED, JSON.stringify(scheduledLessons)),
                AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(lessonLogs)),
                activeSession
                    ? AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(activeSession))
                    : AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION),
            ]);
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    // Student functions
    const addStudent = (student: Omit<Student, 'id'>): Student => {
        const newStudent = { ...student, id: Date.now().toString() };
        setStudents(prev => [...prev, newStudent]);
        return newStudent;
    };

    const removeStudent = (id: string) => {
        setStudents(prev => prev.filter(s => s.id !== id));
        // Also remove related scheduled lessons and logs
        setScheduledLessons(prev => prev.filter(l => l.studentId !== id));
    };

    const updateStudent = (id: string, updates: Partial<Student>) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    // Scheduled lesson functions
    const addScheduledLesson = (lesson: Omit<ScheduledLesson, 'id'>) => {
        setScheduledLessons(prev => [...prev, { ...lesson, id: Date.now().toString() }]);
    };

    const removeScheduledLesson = (id: string) => {
        setScheduledLessons(prev => prev.filter(l => l.id !== id));
    };

    const updateScheduledLesson = (id: string, updates: Partial<ScheduledLesson>) => {
        setScheduledLessons(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    };

    // Lesson log functions
    const addLessonLog = (log: Omit<LessonLog, 'id'>) => {
        setLessonLogs(prev => [{ ...log, id: Date.now().toString() }, ...prev]);
    };

    const removeLessonLog = (id: string) => {
        setLessonLogs(prev => prev.filter(l => l.id !== id));
    };

    const getLogsForStudent = (studentId: string) => {
        return lessonLogs.filter(log => log.studentId === studentId);
    };

    const getLogsForDate = (date: string) => {
        return lessonLogs.filter(log => log.date === date);
    };

    // Session functions
    const startSession = (studentId: string, studentName: string) => {
        setActiveSession({
            studentId,
            studentName,
            startTime: Date.now(),
        });
    };

    const endSession = () => {
        setActiveSession(null);
    };

    return (
        <DataContext.Provider value={{
            isLoading,
            students,
            addStudent,
            removeStudent,
            updateStudent,
            scheduledLessons,
            addScheduledLesson,
            updateScheduledLesson,
            removeScheduledLesson,
            lessonLogs,
            addLessonLog,
            removeLessonLog,
            getLogsForStudent,
            getLogsForDate,
            activeSession,
            startSession,
            endSession,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
}
