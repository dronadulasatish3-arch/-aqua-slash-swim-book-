// ───────────────────────────────────────────────────────────
// Aqua Slash — Face Biometrics & Registration Storage
// Client-side face profile enrollment, verification, and link to central attendance
// ───────────────────────────────────────────────────────────

export interface FaceRegistration {
  studentId: string;
  studentName: string;
  email: string;
  mobile: string;
  photoDataUrl: string; // Base64 JPEG/PNG captured from front camera
  registeredAt: string;
}

const FACE_REGISTRY_KEY = 'aquaslash-face-registry-v1';
export const CENTRAL_ATTENDANCE_URL = 'https://dronadulasatish3-arch.github.io/aqua-slash-attendance/';
export const CENTRAL_ATTENDANCE_API = 'https://script.google.com/macros/s/AKfycbwexwYWfDzvDUE47dUALCy9m9w3Eu-OwyjWg34e7t5tFJlVt2NPH7UY1lWco8lH3eWLEA/exec';

export function getAllRegisteredFaces(): FaceRegistration[] {
  try {
    const raw = localStorage.getItem(FACE_REGISTRY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read face registry:', e);
  }
  return [];
}

export function getRegisteredFace(studentId: string): FaceRegistration | null {
  if (!studentId) return null;
  const clean = studentId.trim().toUpperCase();
  const all = getAllRegisteredFaces();
  return all.find((f) => f.studentId.toUpperCase() === clean) || null;
}

export function saveRegisteredFace(reg: FaceRegistration): void {
  const all = getAllRegisteredFaces().filter(
    (f) => f.studentId.toUpperCase() !== reg.studentId.trim().toUpperCase()
  );
  all.unshift(reg);
  try {
    localStorage.setItem(FACE_REGISTRY_KEY, JSON.stringify(all.slice(0, 20)));
    localStorage.setItem(`aquaslash-face-data-v1:${reg.studentId.trim().toUpperCase()}`, reg.photoDataUrl);
    // Notify window listeners
    window.dispatchEvent(new CustomEvent('aquaslash-face-registered', { detail: reg.studentId }));
  } catch (e) {
    console.warn('Failed to save face registration:', e);
  }
}

export function deleteRegisteredFace(studentId: string): void {
  const clean = studentId.trim().toUpperCase();
  const all = getAllRegisteredFaces().filter((f) => f.studentId.toUpperCase() !== clean);
  try {
    localStorage.setItem(FACE_REGISTRY_KEY, JSON.stringify(all));
    localStorage.removeItem(`aquaslash-face-data-v1:${clean}`);
    window.dispatchEvent(new CustomEvent('aquaslash-face-deleted', { detail: clean }));
  } catch (e) {
    console.warn('Failed to delete face registration:', e);
  }
}

/**
 * Generates direct pre-filled registration link for central Aqua Slash Attendance
 */
export function getCentralAttendanceRegisterUrl(student: {
  studentName?: string;
  studentId?: string;
  mobile?: string;
  email?: string;
}): string {
  const params = new URLSearchParams();
  if (student.studentName) params.set('name', student.studentName);
  if (student.studentId) params.set('id', student.studentId);
  if (student.mobile) params.set('phone', student.mobile);
  if (student.email) params.set('email', student.email);
  return `${CENTRAL_ATTENDANCE_URL}#register?${params.toString()}`;
}
