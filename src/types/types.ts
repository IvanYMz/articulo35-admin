// src/types/types.ts

export type Student = {
    id: number;
    student_id: number;
    name: string;
    subjects: {name: string, status: string}[];
};

export type StudentDetails = {
    personalData: {
        student_id: number;
        full_name: string;
        email: string;
    };
    academicRecords: {
        student_code: string;
        career: string;
        average_score: number;
        enrollment_cycle: string;
        graduation_cycle: string;
        approved_credits: number;
        pending_credits: number;
        division: string;
    };
    requests: Request[];
};

export type AcademicRecord = {
    id: number;
    student_id: number;
    full_name: string;
    requests: { subject_id: number, status: string }[];
};

export type AvailableSubject = {
    id: number;
    name: string;
};


export type Request = {
    subject_id: string;
    status: string;
    description: string;
    available_subjects: {
        name: string;
        nrc: string
    };
};

export type UrlResponse = {
    audioUrl: string;
    audioFileName: string;
    transcriptionContent: TranscriptionContent;
    error?: string;
};

export type TranscriptionContent = {
    content: string, 
    textFileName: string,
};

export type FileData = {
    name: string;
    url: string;
    folder: string;
};

export type StudentFiles = FileData[];