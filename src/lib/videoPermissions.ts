import type { MediaItem } from '../components/SwimVideoDashboard';

export interface UserAuthContext {
  isAdmin: boolean;
  studentId: string;
  studentName?: string;
  authorizedStudentIds?: string[];
  email?: string;
  mobile?: string;
}

/**
 * Validates whether the authenticated user has permission to view a given video.
 *
 * Rules:
 * 1. Admin can access all videos.
 * 2. PUBLIC videos can be watched by all authenticated students/parents.
 * 3. PRIVATE videos are accessible ONLY if the video is assigned to the user's studentId
 *    or one of the authorized children's studentIds.
 */
export function canUserAccessVideo(video: MediaItem, user: UserAuthContext): boolean {
  if (!video) return false;

  // 1. Admin has unrestricted access to everything
  if (user.isAdmin) return true;

  // 2. Public videos are accessible to all authenticated users
  const isPublic = !video.access || video.access.toLowerCase() === 'public';
  if (isPublic) return true;

  // 3. Private videos require explicit student ID authorization
  const allAuthorizedIds = new Set<string>();
  if (user.studentId) allAuthorizedIds.add(user.studentId.trim().toUpperCase());
  if (user.authorizedStudentIds && Array.isArray(user.authorizedStudentIds)) {
    user.authorizedStudentIds.forEach((id) => allAuthorizedIds.add(id.trim().toUpperCase()));
  }

  // Check assignedStudentIds array
  if (video.assignedStudentIds && Array.isArray(video.assignedStudentIds) && video.assignedStudentIds.length > 0) {
    const hasMatch = video.assignedStudentIds.some((assignedId) =>
      allAuthorizedIds.has(assignedId.trim().toUpperCase())
    );
    if (hasMatch) return true;
  }

  // Check legacy assignedTo string (could be 'Satish', 'Penga', or 'AS-1021')
  if (video.assignedTo) {
    const assignedStr = video.assignedTo.trim().toUpperCase();
    for (const authId of allAuthorizedIds) {
      if (assignedStr.includes(authId)) return true;
    }
    if (user.studentName && assignedStr.includes(user.studentName.trim().toUpperCase())) {
      return true;
    }
  }

  return false;
}

/**
 * Filters a video list based on user authorization and view mode.
 *
 * Modes:
 * - 'my-videos': Returns ONLY private/assigned videos specifically meant for this student/child.
 * - 'public': Returns ONLY public educational videos.
 * - 'all': For Admin, returns the entire library with full management capabilities.
 */
export function filterVideosForUser(
  videos: MediaItem[],
  user: UserAuthContext,
  mode: 'my-videos' | 'public' | 'all'
): MediaItem[] {
  if (!Array.isArray(videos)) return [];

  if (mode === 'my-videos') {
    const targetStudentId = (user.studentId || '').trim().toUpperCase();
    const authorizedIds = new Set<string>();
    if (targetStudentId) authorizedIds.add(targetStudentId);
    if (user.authorizedStudentIds && Array.isArray(user.authorizedStudentIds)) {
      user.authorizedStudentIds.forEach((id) => authorizedIds.add(id.trim().toUpperCase()));
    }

    return videos.filter((v) => {
      // Must be authorized for this user
      if (!canUserAccessVideo(v, user)) return false;

      // Must be specifically assigned to this student ID or linked child ID
      if (v.assignedStudentIds && Array.isArray(v.assignedStudentIds) && v.assignedStudentIds.length > 0) {
        return v.assignedStudentIds.some((id) => authorizedIds.has(id.trim().toUpperCase()));
      }

      // Fallback: check assignedTo text string
      if (v.assignedTo) {
        const assignedUpper = v.assignedTo.trim().toUpperCase();
        for (const authId of authorizedIds) {
          if (assignedUpper.includes(authId)) return true;
        }
        if (user.studentName && assignedUpper.includes(user.studentName.trim().toUpperCase())) {
          return true;
        }
      }

      return false;
    });
  }

  if (mode === 'public') {
    return videos.filter((v) => {
      const isPublic = !v.access || v.access.toLowerCase() === 'public';
      return isPublic && canUserAccessVideo(v, user);
    });
  }

  // 'all' mode: For Admin, or fallback to all authorized videos
  if (user.isAdmin) {
    return videos;
  }
  return videos.filter((v) => canUserAccessVideo(v, user));
}

/**
 * Organizes videos by Swimming Level and Upload Date.
 */
export function organizeVideosByLevelAndDate(videos: MediaItem[]): {
  level: string;
  videos: MediaItem[];
}[] {
  const groups: Record<string, MediaItem[]> = {};

  const order = [
    'Glass 1',
    'Glass 2',
    'Glass 3',
    'Pool 1',
    'Pool 2',
    'Pool 3',
    'Pool 4',
    'All Levels',
    'Water Safety',
    'Other',
  ];

  for (const v of videos) {
    const lvl = v.swimmingLevel || 'All Levels';
    if (!groups[lvl]) groups[lvl] = [];
    groups[lvl].push(v);
  }

  // Sort inside each group by date descending
  for (const lvl in groups) {
    groups[lvl].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }

  // Return in structured order
  const result: { level: string; videos: MediaItem[] }[] = [];
  for (const key of order) {
    if (groups[key] && groups[key].length > 0) {
      result.push({ level: key, videos: groups[key] });
      delete groups[key];
    }
  }

  // Any remaining custom levels
  for (const key in groups) {
    if (groups[key].length > 0) {
      result.push({ level: key, videos: groups[key] });
    }
  }

  return result;
}
