import { CONFIG } from '../config';

export interface Student {
  studentId: string;
  studentName: string;
  email: string;
  mobile: string;
  age: number | string;
  parentName: string;
  parentMobile: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  currentLevel: string;
  role: 'STUDENT' | 'ADMIN';
  status: 'Active' | 'Inactive' | string;
  lastLogin: string;
  faceRegistered?: boolean;
  photoUrl?: string;
}

export interface AttendanceRecord {
  timestamp: string;
  date: string;
  studentId: string;
  studentName?: string;
  status: 'Present' | 'Absent' | string;
  method: string;
  notes?: string;
}

export interface AttendanceSummary {
  studentId: string;
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  percentage: number;
  history: AttendanceRecord[];
  allSummary?: Record<string, { total: number; present: number; absent: number; studentName?: string }>;
}

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  message?: string;
  error?: string;
  user?: T;
  loginTime?: string;
  student?: Partial<Student>;
  existing?: boolean;
  alreadyMarked?: boolean;
  [key: string]: unknown;
}

export class ApiError extends Error {
  code: 'NETWORK' | 'SERVER';
  constructor(message: string, code: 'NETWORK' | 'SERVER') {
    super(message);
    this.code = code;
  }
}

async function call<T = Record<string, unknown>>(action: string, params: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
  const body = { action, ...params };
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);
  try {
    let res: Response;
    try {
      res = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body),
        redirect: 'follow',
        signal: controller.signal,
      });
    } catch {
      if (controller.signal.aborted) {
        throw new ApiError('The Aqua Slash server took too long to respond. Please try again.', 'NETWORK');
      }
      throw new ApiError('Unable to reach the Aqua Slash server. Please check your internet connection and try again.', 'NETWORK');
    }

    const text = await res.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new ApiError('The Aqua Slash server returned an unexpected response format.', 'SERVER');
    }
    if (!res.ok) {
      throw new ApiError(`The Aqua Slash server returned HTTP ${res.status}.`, 'SERVER');
    }
    if (!parsed || typeof parsed !== 'object' || !('success' in parsed) || typeof parsed.success !== 'boolean') {
      throw new ApiError('The Aqua Slash server returned an invalid response structure.', 'SERVER');
    }
    return parsed as ApiResponse<T>;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) {
      throw new ApiError('The Aqua Slash server took too long to respond. Please try again.', 'NETWORK');
    }
    throw new ApiError('Unable to read the Aqua Slash server response. Please try again.', 'SERVER');
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export const api = {
  login: async (identifier: string, password?: string) => {
    return call<{
      studentId: string;
      name: string;
      studentName: string;
      email: string;
      mobile?: string;
      phone?: string;
      role?: 'STUDENT' | 'ADMIN';
      currentLevel?: string;
      faceRegistered?: boolean;
    }>('LOGIN', {
      identifier: identifier.trim(),
      email: identifier.trim(),
      phone: identifier.trim(),
      mobile: identifier.trim(),
      password: password || '',
    });
  },

  register: async (params: {
    name: string;
    email: string;
    phone?: string;
    mobile?: string;
    password?: string;
    studentId?: string;
  }) => {
    const cleanPhone = (params.phone || params.mobile || '').trim();
    return call<{
      studentId: string;
      name: string;
      studentName: string;
      email: string;
      mobile?: string;
      phone?: string;
      role?: 'STUDENT' | 'ADMIN';
    }>('REGISTER', {
      ...params,
      phone: cleanPhone,
      mobile: cleanPhone,
    });
  },

  resetPassword: async (identifier: string, newPassword: string, name?: string) => {
    return call<{ studentId: string; name: string; email: string; phone?: string; mobile?: string }>('RESET_PASSWORD', {
      identifier: identifier.trim(),
      email: identifier.trim(),
      phone: identifier.trim(),
      mobile: identifier.trim(),
      newPassword,
      password: newPassword,
      name: name || '',
    });
  },

  markAttendance: async (p: { studentId: string; studentName?: string; status?: string; method?: string; confidence?: string; notes?: string; date?: string; timestamp?: string }) => {
    return call('MARK_ATTENDANCE', { ...p });
  },

  getAttendance: async (p?: { studentId?: string; role?: string; email?: string; studentName?: string }) => {
    return call<AttendanceSummary>('GET_ATTENDANCE', { ...p });
  },

  updateStudentLevel: async (p: { studentId: string; currentLevel: string; studentName?: string; stage?: string }) => {
    return call<{ studentId: string; currentLevel: string }>('UPDATE_STUDENT_LEVEL', { ...p });
  },

  getAllStudents: async () => {
    return call<{ students: Array<{ studentId: string; studentName: string; email: string; mobile?: string; phone?: string; faceRegistered: boolean }> }>('GET_ALL_STUDENTS');
  },

  submitFeedback: async (p: { studentId: string; studentName: string; learningExperience: string; studentFeedback: string; token?: string; email?: string; phone?: string }) => {
    return call('SUBMIT_FEEDBACK', { ...p });
  },
};
