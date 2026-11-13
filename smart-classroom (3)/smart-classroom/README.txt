Smart Classroom Management System - run on your computer

1. Unzip this folder.
2. Double-click index.html (Chrome, Edge or Firefox).
   If uploads or the teacher page do not work, start a tiny local server:
     Install Python (python.org), open a terminal in this folder and run:  python -m http.server 8000
     then open http://localhost:8000
3. Student login: register number + name exactly as in the CSE-F class list (roster.js).
   Teacher login: username admin, password srm@1234 (change it in app.js, function login).

How attendance is calculated
- Classes conducted are counted automatically from the timetable (20 Jul to 20 Nov 2026, Monday-Friday),
  minus any holidays you enter. You only enter how many classes you missed.
- Internal marks: CLA-1 and CLA-2 are entered out of 50 and converted to 15 each (marks x 15 / 50).

Notes
- Everything is saved in this browser only; study materials posted by the teacher appear for students
  only in the same browser on the same computer. To share with all students, host the folder online
  and replace local.js with a real database/file storage.
- Languages: HTML, CSS, JavaScript. No machine learning model is used (rule-based calculations).
