import { CONFIG } from '../config';

/** Exact message required, with the logged-in student's ID and name filled in automatically. */
export function whatsappMessage(student: { studentId: string; studentName: string }) {
  return `Hi Aqua Slash, I need help with my swimming learning journey.\n\nStudent ID: ${student.studentId}\nName: ${student.studentName}`;
}

/** https://wa.me/916305252050 (06305252050 → India international format) with the message pre-filled. */
export function whatsappLink(student: { studentId: string; studentName: string }) {
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage(student))}`;
}
