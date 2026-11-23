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
    currentLevel: 'Level 3 (Coach / Admin)',
    role: 'ADMIN',
    status: 'Active',
  },
  {
    studentId: 'AS-1576',
    studentName: 'satish',
    email: 'dronadulasatish0@gmail.com',
    mobile: '8142385947',
    parentName: '',
    parentEmail: '',
    parentMobile: '',
    currentLevel: 'Level 1',
    role: 'STUDENT',
    status: 'Active',
  },
  {
    studentId: 'AS-3155',
    studentName: 'Jishnu',
    email: 'jishnu1606@gmail.com',
    mobile: '8111937058',
    parentName: '',
    parentEmail: '',
    parentMobile: '',
    currentLevel: 'Level 1',
    role: 'STUDENT',
    status: 'Active',
  },
  {
    studentId: 'AS-1034',
    studentName: 'Khushi mehta',
    email: 'happypeenu@gmail.com',
    mobile: '9035746631',
    parentName: '',
    parentEmail: '',
    parentMobile: '',
    currentLevel: 'Level 1',
    role: 'STUDENT',
    status: 'Active',
  },
  {
    studentId: 'AS-7782',
    studentName: 'Ch.Ajay',
    email: 'chintalaajay3@gmail.com',
    mobile: '9553891082',
    parentName: '',
    parentEmail: '',
    parentMobile: '',
    currentLevel: 'Level 1',
    role: 'STUDENT',
    status: 'Active',
  },
  {
    studentId: 'AS-4280',
    studentName: 'Text 5',
    email: 'dronadulasatish311@gmail.com',
    mobile: '6305252055',
    parentName: '',
    parentEmail: '',
    parentMobile: '',
    currentLevel: 'Level 1',
    role: 'STUDENT',
    status: 'Active',
  },
];

const LOCAL_STORAGE_KEY = 'aquaslash-registered-students-v3';

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
 * Overwrites the full registry with fresh students from Google Sheets.
 */
export function saveAllStudents(students: StudentRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(students));
  } catch (e) {
    console.warn('Failed to persist all students', e);
  }
}

/**
 * Asynchronously syncs students directly from Google Sheets API backend.
 */
export async function syncStudentsFromBackend(): Promise<StudentRecord[]> {
  try {
    const res = await api.getAllStudents();
    if (res && res.success && res.students && Array.isArray(res.students) && res.students.length > 0) {
      const records: StudentRecord[] = res.students
        .filter((bs) => bs && bs.studentId)
        .map((bs) => {
          const role = (bs as any).role || (bs.email?.includes('dronadulasatish') ? 'ADMIN' : 'STUDENT');
          const isCoach = role === 'ADMIN';
          return {
            studentId: bs.studentId,
            studentName: bs.studentName || (bs as any).name || 'Student',
            email: bs.email || '',
            mobile: bs.mobile || (bs as any).phone || '',
            currentLevel: (bs as any).currentLevel || (isCoach ? 'Level 3 (Coach / Admin)' : 'Level 1'),
            role: role,
            status: (bs as any).status || 'Active',
            lastLogin: (bs as any).lastLogin || '',
          };
        });

      if (records.length > 0) {
        saveAllStudents(records);
        return records;
      }
    }
  } catch (err) {
    console.warn('Offline or unable to fetch backend students; using local registry', err);
  }
  return getRegisteredStudents();
}

/**
 * Finds all student profiles linked to a given parent or student account.
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
