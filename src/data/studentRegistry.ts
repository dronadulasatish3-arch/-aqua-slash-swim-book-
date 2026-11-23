import { api } from '../lib/api';

export interface StudentRecord {
  studentId: string;
  studentName: string;
  email: string;
  mobile: string;
  parentName?: string;
  parentEmail?: string;
  parentMobile?: string;
  currentLevel: string;
  role: 'STUDENT' | 'ADMIN';
  status: 'Active' | 'Inactive' | string;
  lastLogin?: string;
  linkedStudentIds?: string[];
}

export const SEED_STUDENTS: StudentRecord[] = [
  {
    studentId: 'AS-ADMIN',
    studentName: 'Satish Dronadula',
    email: 'dronadulasatish3@gmail.com',
    mobile: '6305252050',
    parentName: '',
    parentEmail: '',
    parentMobile: '',
    currentLevel: 'Coach / Admin',
    role: 'ADMIN',
    status: 'Active',
  },
  {
    studentId: 'AS-1021',
    studentName: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    mobile: '9876543210',
    parentName: 'Vikram Sharma',
    parentEmail: 'parent.sharma@gmail.com',
    parentMobile: '9876543210',
    currentLevel: 'Glass 2',
    role: 'STUDENT',
    status: 'Active',
    linkedStudentIds: ['AS-1022'],
  },
  {
    studentId: 'AS-1022',
    studentName: 'Ananya Sharma',
    email: 'ananya.sharma@gmail.com',
    mobile: '9876543210',
    parentName: 'Vikram Sharma',
    parentEmail: 'parent.sharma@gmail.com',
    parentMobile: '9876543210',
    currentLevel: 'Pool 1',
    role: 'STUDENT',
    status: 'Active',
    linkedStudentIds: ['AS-1021'],
  },
  {
    studentId: 'AS-1035',
    studentName: 'Penga',
    email: 'penga@aquaslash.com',
    mobile: '9845012345',
    parentName: 'Rajesh',
    parentEmail: 'rajesh@aquaslash.com',
    parentMobile: '9845012345',
    currentLevel: 'Glass 3',
    role: 'STUDENT',
    status: 'Active',
  },
  {
    studentId: 'AS-1048',
    studentName: 'Rohan Verma',
    email: 'rohan.verma@example.com',
    mobile: '9812345678',
    parentName: 'Sunita Verma',
    parentEmail: 'sunita.verma@example.com',
    parentMobile: '9812345678',
    currentLevel: 'Pool 2',
    role: 'STUDENT',
    status: 'Active',
  },
];

const LOCAL_STORAGE_KEY = 'aquaslash-registered-students-v1';

/**
 * Retrieves all registered students (merging seed data and any dynamically registered students).
 */
export function getRegisteredStudents(): StudentRecord[] {
  let custom: StudentRecord[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      custom = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse local students', e);
  }

  const map = new Map<string, StudentRecord>();
  // Seed first
  for (const s of SEED_STUDENTS) {
    map.set(s.studentId, s);
  }
  // Custom updates / overrides
  for (const c of custom) {
    if (c.studentId) {
      map.set(c.studentId, { ...map.get(c.studentId), ...c });
    }
  }
  return Array.from(map.values());
}

/**
 * Saves or updates a student record in the registry.
 */
export function saveRegisteredStudent(student: StudentRecord): void {
  const current = getRegisteredStudents().filter((s) => s.studentId !== student.studentId);
  current.push(student);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to persist student record', e);
  }
}

/**
 * Asynchronously syncs students from Google Sheets API.
 */
export async function syncStudentsFromBackend(): Promise<StudentRecord[]> {
  try {
    const res = await api.getAllStudents();
    if (res && res.success && res.students && Array.isArray(res.students)) {
      for (const bs of res.students) {
        if (bs.studentId) {
          saveRegisteredStudent({
            studentId: bs.studentId,
            studentName: bs.studentName || 'Student',
            email: bs.email || '',
            mobile: bs.mobile || bs.phone || '',
            currentLevel: 'Level 1',
            role: bs.email?.includes('dronadulasatish') ? 'ADMIN' : 'STUDENT',
            status: 'Active',
          });
        }
      }
    }
  } catch (err) {
    console.warn('Offline or unable to fetch backend students; using local registry', err);
  }
  return getRegisteredStudents();
}

/**
 * Finds all student profiles linked to a given parent or student account.
 * (e.g. matching email, phone number, parent email, parent phone, or student ID).
 */
export function getAuthorizedChildrenForAccount(identifier: string): StudentRecord[] {
  if (!identifier) return [];
  const cleanId = identifier.trim().toLowerCase();
  const digits = identifier.replace(/\D/g, '');
  const all = getRegisteredStudents();

  // If this identifier directly matches a student, find them and any sibling linked IDs
  const matched = all.filter((s) => {
    const sEmail = s.email?.trim().toLowerCase();
    const sPhone = s.mobile?.replace(/\D/g, '');
    const pEmail = s.parentEmail?.trim().toLowerCase();
    const pPhone = s.parentMobile?.replace(/\D/g, '');
    const sId = s.studentId?.trim().toLowerCase();

    // Direct student match
    if (sId === cleanId) return true;
    if (sEmail && sEmail === cleanId) return true;
    if (digits && sPhone && (sPhone === digits || sPhone.endsWith(digits) || digits.endsWith(sPhone))) return true;

    // Parent account match (linking multiple children)
    if (pEmail && pEmail === cleanId) return true;
    if (digits && pPhone && (pPhone === digits || pPhone.endsWith(digits) || digits.endsWith(pPhone))) return true;

    return false;
  });

  // Also collect any explicitly linked sibling IDs
  const foundIds = new Set(matched.map((m) => m.studentId));
  for (const m of matched) {
    if (m.linkedStudentIds && Array.isArray(m.linkedStudentIds)) {
      for (const lid of m.linkedStudentIds) {
        if (!foundIds.has(lid)) {
          const sibling = all.find((s) => s.studentId === lid);
          if (sibling) {
            matched.push(sibling);
            foundIds.add(lid);
          }
        }
      }
    }
  }

  return matched;
}
