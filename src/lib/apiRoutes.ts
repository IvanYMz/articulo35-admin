const API_BASE = import.meta.env.PUBLIC_API_BASE_URL;

export const API_ROUTES = {
    AUTH_SIGNOUT: `${API_BASE}/api/auth/signout`,
    STUDENT_REQUEST_STATUS: `${API_BASE}/api/students_info/request_status`,
    STUDENTS_LIST: `${API_BASE}/api/students_info/requests`,
    STUDENT_FILES: (id: string) => `${API_BASE}/api/students_info/details/student_files/${id}`,
    STUDENT_DETAILS: (id: string) => `${API_BASE}/api/students_info/details/${id}`,
    STUDENT_STATEMENT: (id: string) => `${API_BASE}/api/students_info/transcription/${id}`,  
};