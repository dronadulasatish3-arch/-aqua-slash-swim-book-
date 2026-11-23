/**
 * =========================================================================
 * AQUA SLASH — UNIFIED BACKEND SCRIPT (v6.0)
 * =========================================================================
 * Handles:
 *  1. Student Registration (Name, Email, Mobile/Phone, Password)
 *  2. Student & Admin Login (Supports login via EMAIL or PHONE NUMBER with same password)
 *  3. Password Reset & Change (Anytime via Email or Phone Number)
 *  4. Swim Book Progress & Attendance
 *  5. Swim Video Library Sync & Media Access (Automatic Google Drive Upload & Sheet Sync)
 *  6. Student Feedback to Google Sheets
 *
 * HOW TO DEPLOY:
 *  1. Open your Google Sheet
 *  2. Extensions > Apps Script
 *  3. Replace Code.gs with this code and Save (Ctrl+S)
 *  4. Click: Deploy > Manage deployments > Edit > Version: New version > Deploy!
 * =========================================================================
 */

var ADMIN_EMAILS = [
  'dronadulasatish3@gmail.com',
  'dronadulasatish@gmail.com',
  'admin@aquaslash.com'
];
var ADMIN_PHONES = ['6305252050', '916305252050'];

var SHEETS = {
  STUDENTS: 'Students',
  LOGINS: 'Login Activity',
  ATTENDANCE: 'Attendance',
  FEEDBACK: 'Student Feedback',
  MEDIA: 'Media Library'
};

var HEADERS = {
  STUDENTS: [
    'Timestamp', 'Student ID', 'Student Name', 'Email', 'Phone Number',
    'Password Hash', 'Role', 'Current Level', 'Status', 'Last Login'
  ],
  LOGINS: [
    'Timestamp', 'Student ID', 'Student Name', 'Login Identifier', 'Method', 'Status'
  ],
  ATTENDANCE: [
    'Timestamp', 'Student ID', 'Student Name', 'Status', 'Method', 'Notes'
  ],
  FEEDBACK: [
    'Timestamp', 'Student ID', 'Student Name', 'Email/Phone', 'Learning Experience', 'Student Feedback'
  ],
  MEDIA: [
    'Timestamp', 'Media ID', 'Title', 'Category', 'Access', 'Type', 'URL', 'Description', 'Swimming Level', 'Assigned Student IDs'
  ]
};

// ==========================================
// 1. HTTP ENTRY POINTS
// ==========================================

function doGet(e) {
  var p = (e && e.parameter) || {};
  var action = String(p.action || 'ping');
  return jsonResponse_(handleAction_(action, p));
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    body = {};
  }
  var p = (e && e.parameter) || {};
  var action = String(body.action || p.action || 'ping');
  return jsonResponse_(handleAction_(action, body));
}

function jsonResponse_(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ==========================================
// 2. DISPATCHER
// ==========================================

function handleAction_(action, p) {
  try {
    switch (action.toUpperCase()) {
      case 'PING':
        return { success: true, message: 'Aqua Slash Backend is online and healthy.', time: new Date().toISOString() };
      
      case 'SETUP':
        return setup();

      case 'LOGIN':
        return handleLogin_(p);

      case 'REGISTER':
        return handleRegister_(p);

      case 'RESET_PASSWORD':
      case 'CHANGE_PASSWORD':
        return handlePasswordChange_(p);

      case 'GET_ALL_STUDENTS':
        return handleGetAllStudents_(p);

      case 'MARK_ATTENDANCE':
        return handleMarkAttendance_(p);

      case 'SUBMIT_FEEDBACK':
        return handleSubmitFeedback_(p);

      case 'LIST':
      case 'LIST_MEDIA':
      case 'GET_MEDIA':
        return handleListMedia_(p);

      case 'UPLOAD':
      case 'UPLOAD_MEDIA':
      case 'SAVE_MEDIA':
        return handleSaveMedia_(p);

      case 'SYNC_MEDIA_BATCH':
        return handleSyncMediaBatch_(p);

      case 'DELETE':
      case 'DELETE_MEDIA':
        return handleDeleteMedia_(p);

      default:
        return { success: false, error: 'Unknown action: ' + action };
    }
  } catch (err) {
    return { success: false, error: 'Server error: ' + err.toString() };
  }
}

// ==========================================
// 3. CORE LOGIC (LOGIN, REGISTER, PASSWORD)
// ==========================================

function cleanPhone_(phone) {
  if (!phone) return '';
  var clean = String(phone).replace(/[^\d]/g, '');
  if (clean.length > 10 && (clean.indexOf('91') === 0)) {
    clean = clean.substring(2);
  }
  return clean;
}

function cleanEmail_(email) {
  return String(email || '').trim().toLowerCase();
}

function hashPassword_(raw) {
  if (!raw) return '';
  var signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(raw), Utilities.Charset.UTF_8);
  var hex = '';
  for (var i = 0; i < signature.length; i++) {
    var b = signature[i];
    if (b < 0) b += 256;
    var byteString = b.toString(16);
    if (byteString.length == 1) byteString = '0' + byteString;
    hex += byteString;
  }
  return hex;
}

function verifyPassword_(inputPassword, storedHash) {
  if (!storedHash) return true;
  if (!inputPassword) return false;
  if (String(storedHash) === String(inputPassword)) return true;
  if (hashPassword_(inputPassword) === String(storedHash)) return true;
  return false;
}

function handleLogin_(p) {
  var identifier = String(p.identifier || p.email || p.phone || p.mobile || '').trim();
  var password = String(p.password || '').trim();

  if (!identifier) {
    return { success: false, error: 'Please enter your email address or phone number.' };
  }

  var sheet = ensureSheet_(SHEETS.STUDENTS, HEADERS.STUDENTS);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { success: false, notRegistered: true, error: 'No students found. Please register first.' };
  }

  var isEmail = identifier.indexOf('@') !== -1;
  var targetEmail = cleanEmail_(identifier);
  var targetPhone = cleanPhone_(identifier);

  var foundRow = -1;
  var student = null;

  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var rowEmail = cleanEmail_(row[3]);
    var rowPhone = cleanPhone_(row[4]);

    var match = false;
    if (isEmail && rowEmail && rowEmail === targetEmail) {
      match = true;
    } else if (!isEmail && rowPhone && targetPhone && (rowPhone === targetPhone || rowPhone.endsWith(targetPhone) || targetPhone.endsWith(rowPhone))) {
      match = true;
    } else if (rowEmail && rowEmail === targetEmail) {
      match = true;
    }

    if (match) {
      foundRow = r + 1;
      student = {
        studentId: String(row[1]),
        studentName: String(row[2]),
        name: String(row[2]),
        email: String(row[3]),
        mobile: String(row[4]),
        phone: String(row[4]),
        passwordHash: String(row[5]),
        role: String(row[6] || 'STUDENT'),
        currentLevel: String(row[7] || 'Level 1'),
        status: String(row[8] || 'Active'),
        lastLogin: String(row[9] || '')
      };
      break;
    }
  }

  if (!student) {
    return { success: false, notRegistered: true, error: 'Account not found. Please register with your email and phone.' };
  }

  if (password && student.passwordHash) {
    if (!verifyPassword_(password, student.passwordHash)) {
      return { success: false, error: 'Incorrect password. Click Forgot Password to reset it anytime.' };
    }
  }

  var now = new Date();
  sheet.getRange(foundRow, 10).setValue(Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss'));
  logLogin_(student.studentId, student.studentName, identifier, 'Success');

  return {
    success: true,
    message: 'Welcome back, ' + student.studentName + '!',
    user: {
      studentId: student.studentId,
      studentName: student.studentName,
      name: student.studentName,
      email: student.email,
      mobile: student.mobile,
      phone: student.mobile,
      role: student.role,
      currentLevel: student.currentLevel,
      status: student.status
    }
  };
}

function handleRegister_(p) {
  var name = String(p.name || p.studentName || '').trim();
  var email = cleanEmail_(p.email);
  var phone = cleanPhone_(p.phone || p.mobile);
  var rawPassword = String(p.password || '').trim();

  if (!name) return { success: false, error: 'Please enter your full name.' };
  if (!email && !phone) return { success: false, error: 'Please provide either an email or a phone number.' };

  var sheet = ensureSheet_(SHEETS.STUDENTS, HEADERS.STUDENTS);
  var data = sheet.getDataRange().getValues();

  for (var r = 1; r < data.length; r++) {
    var existingEmail = cleanEmail_(data[r][3]);
    var existingPhone = cleanPhone_(data[r][4]);

    if (email && existingEmail === email) {
      return { success: false, error: 'This email is already registered. Please log in.' };
    }
    if (phone && existingPhone && existingPhone === phone) {
      return { success: false, error: 'This phone number is already registered. Please log in.' };
    }
  }

  var studentId = p.studentId || ('AS-' + Math.floor(1000 + Math.random() * 9000));
  var now = new Date();
  var timeStr = Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');

  var role = 'STUDENT';
  if (ADMIN_EMAILS.indexOf(email) !== -1 || ADMIN_PHONES.indexOf(phone) !== -1) {
    role = 'ADMIN';
  }

  var passHash = rawPassword ? hashPassword_(rawPassword) : '';

  sheet.appendRow([
    timeStr,
    studentId,
    name,
    email,
    phone,
    passHash,
    role,
    'Level 1',
    'Active',
    timeStr
  ]);

  logLogin_(studentId, name, email || phone, 'Registered');

  return {
    success: true,
    message: 'Registration successful! Welcome to Aqua Slash.',
    user: {
      studentId: studentId,
      studentName: name,
      name: name,
      email: email,
      mobile: phone,
      phone: phone,
      role: role,
      currentLevel: 'Level 1',
      status: 'Active'
    }
  };
}

function handlePasswordChange_(p) {
  var identifier = String(p.identifier || p.email || p.phone || p.mobile || '').trim();
  var newPassword = String(p.newPassword || p.password || '').trim();

  if (!identifier) return { success: false, error: 'Please provide your email address or phone number.' };
  if (!newPassword || newPassword.length < 4) return { success: false, error: 'New password must be at least 4 characters.' };

  var isEmail = identifier.indexOf('@') !== -1;
  var targetEmail = cleanEmail_(identifier);
  var targetPhone = cleanPhone_(identifier);

  var sheet = ensureSheet_(SHEETS.STUDENTS, HEADERS.STUDENTS);
  var data = sheet.getDataRange().getValues();
  var foundRow = -1;
  var studentName = '';
  var studentId = '';

  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var rowEmail = cleanEmail_(row[3]);
    var rowPhone = cleanPhone_(row[4]);

    if ((isEmail && rowEmail === targetEmail) || (!isEmail && rowPhone && rowPhone === targetPhone) || (rowEmail === targetEmail)) {
      foundRow = r + 1;
      studentId = String(row[1]);
      studentName = String(row[2]);
      break;
    }
  }

  if (foundRow === -1) {
    return { success: false, error: 'No account found with this email or phone number.' };
  }

  var newHash = hashPassword_(newPassword);
  sheet.getRange(foundRow, 6).setValue(newHash);

  return {
    success: true,
    message: 'Password successfully updated! You can now log in with your email or phone number.',
    studentId: studentId,
    studentName: studentName
  };
}

function handleGetAllStudents_(p) {
  var sheet = ensureSheet_(SHEETS.STUDENTS, HEADERS.STUDENTS);
  var data = sheet.getDataRange().getValues();
  var students = [];

  for (var r = 1; r < data.length; r++) {
    students.push({
      studentId: String(data[r][1]),
      studentName: String(data[r][2]),
      name: String(data[r][2]),
      email: String(data[r][3]),
      phone: String(data[r][4]),
      mobile: String(data[r][4]),
      role: String(data[r][6]),
      currentLevel: String(data[r][7]),
      status: String(data[r][8]),
      lastLogin: String(data[r][9])
    });
  }

  return { success: true, students: students };
}

function handleMarkAttendance_(p) {
  var studentId = String(p.studentId || '');
  var studentName = String(p.studentName || '');
  var status = String(p.status || 'Present');
  var method = String(p.method || 'Manual');
  var notes = String(p.notes || '');

  var sheet = ensureSheet_(SHEETS.ATTENDANCE, HEADERS.ATTENDANCE);
  var now = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
  sheet.appendRow([now, studentId, studentName, status, method, notes]);

  return { success: true, message: 'Attendance recorded successfully.' };
}

function handleSubmitFeedback_(p) {
  var studentId = String(p.studentId || '');
  var studentName = String(p.studentName || '');
  var emailOrPhone = String(p.email || p.phone || '');
  var experience = String(p.learningExperience || '');
  var feedback = String(p.studentFeedback || '');

  var sheet = ensureSheet_(SHEETS.FEEDBACK, HEADERS.FEEDBACK);
  var now = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
  sheet.appendRow([now, studentId, studentName, emailOrPhone, experience, feedback]);

  return { success: true, message: 'Thank you for your feedback!' };
}

// ==========================================
// 4. MEDIA REPOSITORY & DRIVE SYNC
// ==========================================

function handleListMedia_(p) {
  var sheet = ensureSheet_(SHEETS.MEDIA, HEADERS.MEDIA);
  var data = sheet.getDataRange().getValues();

  // Auto-seed default videos if empty
  if (data.length <= 1) {
    seedDefaultMedia_(sheet);
    data = sheet.getDataRange().getValues();
  }

  var items = [];
  var requestingStudentId = String(p.studentId || '').trim().toUpperCase();
  var isAdmin = String(p.role || '').toUpperCase() === 'ADMIN' || ADMIN_EMAILS.indexOf(cleanEmail_(p.email)) !== -1;

  for (var r = 1; r < data.length; r++) {
    var access = String(data[r][4] || 'Public');
    var assignedIdsRaw = String(data[r][9] || '');
    var assignedIds = assignedIdsRaw ? assignedIdsRaw.split(',').map(function(s) { return s.trim().toUpperCase(); }) : [];

    // Backend Security: Private videos require Admin role or matched studentId
    if (access.toLowerCase() === 'private' && !isAdmin) {
      if (!requestingStudentId || assignedIds.indexOf(requestingStudentId) === -1) {
        continue;
      }
    }

    var mediaUrl = String(data[r][6] || '');
    items.push({
      id: String(data[r][1]),
      title: String(data[r][2]),
      category: String(data[r][3]),
      access: access,
      type: String(data[r][5]),
      driveViewUrl: mediaUrl,
      url: mediaUrl,
      previewUrl: mediaUrl,
      directUrl: mediaUrl,
      description: String(data[r][7]),
      swimmingLevel: String(data[r][8] || 'All Levels'),
      assignedStudentIds: assignedIds
    });
  }

  return { status: 'ok', success: true, items: items };
}

function handleSaveMedia_(p) {
  var sheet = ensureSheet_(SHEETS.MEDIA, HEADERS.MEDIA);
  var now = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
  var id = String(p.id || ('media_' + Date.now()));
  var title = String(p.title || 'Swim Video HD');
  var category = String(p.category || 'Swimming Basics');
  var access = String(p.access || 'Public');
  var type = String(p.type || 'video');
  var url = String(p.driveViewUrl || p.url || p.directUrl || '');
  var description = String(p.description || '');
  var level = String(p.swimmingLevel || 'All Levels');
  var studentIds = Array.isArray(p.assignedStudentIds) ? p.assignedStudentIds.join(',') : String(p.assignedStudentIds || p.assignedTo || '');

  // Google Drive upload if base64Data is present
  var base64Data = p.base64Data || p.base64 || p.fileData;
  if (base64Data) {
    try {
      var folderName = 'Aqua Slash Swim Media';
      var folders = DriveApp.getFoldersByName(folderName);
      var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      var cleanBase64 = base64Data.indexOf(',') !== -1 ? base64Data.split(',')[1] : base64Data;
      var fileName = p.fileName || (title.replace(/[^a-zA-Z0-9_-]/g, '_') + (type === 'photo' ? '.jpg' : '.mp4'));
      var mimeType = p.mimeType || (type === 'photo' ? 'image/jpeg' : 'video/mp4');
      var decoded = Utilities.base64Decode(cleanBase64);
      var blob = Utilities.newBlob(decoded, mimeType, fileName);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      url = 'https://drive.google.com/file/d/' + file.getId() + '/view';
    } catch (err) {
      Logger.log('Drive upload warning: ' + err.toString());
    }
  }

  // Update existing row or append new
  var data = sheet.getDataRange().getValues();
  var foundRow = -1;
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][1]) === id) {
      foundRow = r + 1;
      break;
    }
  }

  var rowValues = [
    now,
    id,
    title,
    category,
    access,
    type,
    url,
    description,
    level,
    studentIds
  ];

  if (foundRow !== -1) {
    sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return {
    success: true,
    message: 'Media saved successfully.',
    item: {
      id: id,
      title: title,
      category: category,
      access: access,
      type: type,
      driveViewUrl: url,
      url: url,
      previewUrl: url,
      directUrl: url,
      description: description,
      swimmingLevel: level,
      assignedStudentIds: studentIds ? studentIds.split(',') : []
    }
  };
}

function handleSyncMediaBatch_(p) {
  var sheet = ensureSheet_(SHEETS.MEDIA, HEADERS.MEDIA);
  var items = p.items || [];
  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, error: 'No items provided.' };
  }

  var data = sheet.getDataRange().getValues();
  var idToRowMap = {};
  for (var r = 1; r < data.length; r++) {
    idToRowMap[String(data[r][1])] = r + 1;
  }

  var now = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
  var updatedCount = 0;
  var insertedCount = 0;

  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    var id = String(it.id);
    var title = String(it.title || '');
    var category = String(it.category || 'Swimming Basics');
    var access = String(it.access || 'Public');
    var type = String(it.type || 'video');
    var url = String(it.driveViewUrl || it.url || it.directUrl || it.previewUrl || '');
    var description = String(it.description || '');
    var level = String(it.swimmingLevel || 'All Levels');
    var studentIds = Array.isArray(it.assignedStudentIds) ? it.assignedStudentIds.join(',') : String(it.assignedStudentIds || it.assignedTo || '');

    var rowValues = [
      now,
      id,
      title,
      category,
      access,
      type,
      url,
      description,
      level,
      studentIds
    ];

    if (idToRowMap[id]) {
      sheet.getRange(idToRowMap[id], 1, 1, rowValues.length).setValues([rowValues]);
      updatedCount++;
    } else {
      sheet.appendRow(rowValues);
      idToRowMap[id] = sheet.getLastRow();
      insertedCount++;
    }
  }

  return {
    success: true,
    message: 'Synced ' + (updatedCount + insertedCount) + ' items (' + insertedCount + ' new, ' + updatedCount + ' updated).'
  };
}

function handleDeleteMedia_(p) {
  var id = String(p.id || '').trim();
  if (!id) return { success: false, error: 'Media ID required.' };

  var sheet = ensureSheet_(SHEETS.MEDIA, HEADERS.MEDIA);
  var data = sheet.getDataRange().getValues();

  for (var r = 1; r < data.length; r++) {
    if (String(data[r][1]) === id) {
      sheet.deleteRow(r + 1);
      return { success: true, message: 'Media deleted successfully.' };
    }
  }

  return { success: false, error: 'Media not found.' };
}

function seedDefaultMedia_(mediaSheet) {
  var now = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
  var defaultVideos = [
    [
      now,
      '1jWZrsaPQSw-4zRCeIkTStGYmDam-pRi0',
      'Journey of satish',
      'Other',
      'Public',
      'video',
      'https://drive.google.com/file/d/1jWZrsaPQSw-4zRCeIkTStGYmDam-pRi0/view',
      'Personal swimming journey, coaching evolution, and milestones of Satish Dronadula.',
      'All Levels',
      'AS-ADMIN'
    ],
    [
      now,
      '13_-GaElQ20FAy_-zFTwydlv6qMsW5qkN',
      'Breastroke return/turn',
      'Breaststroke',
      'Public',
      'video',
      'https://drive.google.com/file/d/13_-GaElQ20FAy_-zFTwydlv6qMsW5qkN/view',
      'Executing a fast, legal breaststroke open turn comes down to four distinct phases: the touch, the spin, the push, and the pull-out.',
      'Pool 2',
      ''
    ],
    [
      now,
      '1HXN0RW6UMlIQIkR2sMjp_EjjNSusfUL3',
      'Penga — Private Stroke Technique Analysis',
      'Swimming Basics',
      'Private',
      'video',
      'https://drive.google.com/file/d/1HXN0RW6UMlIQIkR2sMjp_EjjNSusfUL3/view',
      'Personal swimming drill practice, head alignment review, and stroke technique analysis for Penga.',
      'Class 3',
      'AS-1035'
    ],
    [
      now,
      '1hL7uO1l4XbO4iWf84U-hU3k1iKkK_z4c',
      'Freestyle Catch & High Elbow Pull',
      'Freestyle',
      'Public',
      'video',
      'https://drive.google.com/file/d/1hL7uO1l4XbO4iWf84U-hU3k1iKkK_z4c/view',
      'Master the front quadrant high-elbow catch to maximize forward propulsion with minimum shoulder strain.',
      'Pool 1',
      ''
    ],
    [
      now,
      '1G_K6J9_D4mZ51R7N4F19b0P3qP0jFf-m',
      'Backstroke Rotation & Head Alignment',
      'Backstroke',
      'Public',
      'video',
      'https://drive.google.com/file/d/1G_K6J9_D4mZ51R7N4F19b0P3qP0jFf-m/view',
      'Long axis body roll drill with steady head positioning and continuous flutter kick propulsion.',
      'Pool 1',
      ''
    ],
    [
      now,
      '1kQ2nZJ38jH8d0vJ_0qQ1Xp6x6O2lW1m_',
      'Butterfly Rhythm & Wave Motion',
      'Butterfly',
      'Public',
      'video',
      'https://drive.google.com/file/d/1kQ2nZJ38jH8d0vJ_0qQ1Xp6x6O2lW1m_/view',
      'Undulation drills from chest to hips with synchronized double kick per stroke cycle.',
      'Pool 3',
      ''
    ],
    [
      now,
      '197_bX3_8Yx0K9v81mK4f1-p83P0kZ2x1',
      'Flip Turn & Hydrodynamic Push-Off',
      'Swimming Drills',
      'Public',
      'video',
      'https://drive.google.com/file/d/197_bX3_8Yx0K9v81mK4f1-p83P0kZ2x1/view',
      'Somersault approach, foot plant on the cross, streamline push-off, and breakout dolphin kick.',
      'Pool 2',
      ''
    ],
    [
      now,
      'whatsapp_qr_as4280',
      'WHATSAPP IMAGE 2026-10-04 AT 8.39.43 PM',
      'Swimming Basics',
      'Private',
      'photo',
      'https://lh3.googleusercontent.com/d/1jWZrsaPQSw-4zRCeIkTStGYmDam-pRi0',
      'Assigned coach review and practice drill for Text 5',
      'All Levels',
      'AS-4280'
    ]
  ];

  for (var i = 0; i < defaultVideos.length; i++) {
    mediaSheet.appendRow(defaultVideos[i]);
  }
}

function logLogin_(studentId, studentName, identifier, status) {
  try {
    var sheet = ensureSheet_(SHEETS.LOGINS, HEADERS.LOGINS);
    var now = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
    sheet.appendRow([now, studentId, studentName, identifier, 'Web App', status]);
  } catch (err) {
    // Non-critical log
  }
}

// ==========================================
// 5. BULLETPROOF SPREADSHEET INITIALIZER
// ==========================================

function getSpreadsheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  
  var files = DriveApp.getFilesByName('Aqua Slash — Unified Database');
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  return SpreadsheetApp.create('Aqua Slash — Unified Database');
}

function ensureSheet_(name, headers) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#06214a')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function setup() {
  var ss = getSpreadsheet_();
  
  ensureSheet_(SHEETS.STUDENTS, HEADERS.STUDENTS);
  ensureSheet_(SHEETS.LOGINS, HEADERS.LOGINS);
  ensureSheet_(SHEETS.ATTENDANCE, HEADERS.ATTENDANCE);
  ensureSheet_(SHEETS.FEEDBACK, HEADERS.FEEDBACK);
  var mediaSheet = ensureSheet_(SHEETS.MEDIA, HEADERS.MEDIA);

  // Seed default media if empty
  if (mediaSheet.getLastRow() <= 1) {
    seedDefaultMedia_(mediaSheet);
  }

  var studentSheet = ensureSheet_(SHEETS.STUDENTS, HEADERS.STUDENTS);
  var data = studentSheet.getDataRange().getValues();
  var adminExists = false;

  for (var r = 1; r < data.length; r++) {
    if (cleanEmail_(data[r][3]) === 'dronadulasatish3@gmail.com') {
      adminExists = true;
      break;
    }
  }

  if (!adminExists) {
    var now = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
    studentSheet.appendRow([
      now,
      'AS-ADMIN',
      'Satish Dronadula',
      'dronadulasatish3@gmail.com',
      '6305252050',
      hashPassword_('satish630525'),
      'ADMIN',
      'Level 3',
      'Active',
      now
    ]);
  }

  return {
    success: true,
    message: 'Aqua Slash Database setup complete! All 5 sheets and Master Admin initialized.',
    spreadsheetUrl: ss.getUrl()
  };
}
