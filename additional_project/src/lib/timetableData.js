// IIIT Sri City, Chittoor - Monsoon 2026 - Official UG 2 Section-Wise Timetable Data

export const INSTITUTION_INFO = {
  name: "Indian Institute of Information Technology Sri City, Chittoor",
  subtitle: "An Institute of National Importance under an Act of Parliament",
  session: "Monsoon 2026",
  batch: "UG 2 (CSE & ECE)"
};

export const SECTIONS = [
  { id: "ALL", name: "All Sections (Combined)" },
  { id: "CSE-1", name: "CSE Section 1" },
  { id: "CSE-2", name: "CSE Section 2" },
  { id: "CSE-3", name: "CSE Section 3" },
  { id: "CSE-4", name: "CSE Section 4" },
  { id: "ECE", name: "ECE Section" }
];

export const TIME_SLOTS = [
  { id: 1, time: "08:45 AM - 09:45 AM", type: "class" },
  { id: 2, time: "09:45 AM - 10:45 AM", type: "class" },
  { id: "break-1", time: "10:45 AM - 11:00 AM", type: "break", label: "BREAK (10:45 - 11:00 AM)" },
  { id: 3, time: "11:00 AM - 12:00 PM", type: "class" },
  { id: 4, time: "12:00 PM - 01:00 PM", type: "class" },
  { id: "lunch", time: "01:00 PM - 02:15 PM", type: "break", label: "LUNCH BREAK (1:00 - 2:15 PM)" },
  { id: 5, time: "02:15 PM - 03:15 PM", type: "class" },
  { id: 6, time: "03:15 PM - 04:15 PM", type: "class" },
  { id: "break-2", time: "04:15 PM - 04:30 PM", type: "break", label: "BREAK (04:15 - 04:30 PM)" },
  { id: 7, time: "04:30 PM - 05:30 PM", type: "class" },
  { id: 8, time: "05:30 PM - 06:30 PM", type: "class" }
];

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const SECTION_TIMETABLES = {
  "CSE-1": {
    Monday: {
      1: { isFree: false, course: "RANAC1", room: "G06", name: "Real Analysis, Numerical Analysis & Calculus" },
      2: { isFree: false, course: "ADSA1", room: "G06", name: "Advanced Data Structure & Algorithms" },
      3: { isFree: false, course: "DBMS1", room: "G05", name: "Database Management Systems" },
      4: { isFree: false, course: "OS1", room: "G04", name: "Operating System" },
      5: { isFree: true, note: "Free Slot" },
      6: { isFree: true, note: "Free Slot" },
      7: { isFree: true, note: "Free Slot" },
      8: { isFree: true, note: "Free Slot" }
    },
    Tuesday: {
      1: { isFree: false, course: "PC1", room: "B05", name: "Professional Communication" },
      2: { isFree: false, course: "OOP1", room: "G04", name: "Object Oriented Programming" },
      3: { isFree: false, course: "DBMS1", room: "G04", name: "Database Management Systems" },
      4: { isFree: true, note: "Free Slot" },
      5: { isFree: false, course: "OS1", room: "G04", name: "Operating System" },
      6: { isFree: false, course: "ADSA1", room: "G04", name: "Advanced Data Structure & Algorithms" },
      7: { isFree: false, course: "RANAC1", room: "G08", name: "Real Analysis, Numerical Analysis & Calculus" },
      8: { isFree: true, note: "Free Slot" }
    },
    Wednesday: {
      1: { isFree: true, note: "Free Slot" },
      2: { isFree: true, note: "Free Slot" },
      3: { isFree: false, course: "ADSA1", room: "G06", name: "Advanced Data Structure & Algorithms" },
      4: { isFree: false, course: "OOP1", room: "G04", name: "Object Oriented Programming" },
      5: { isFree: false, course: "OOP1", room: "Lab 103", name: "Object Oriented Programming Lab" },
      6: { isFree: false, course: "OOP1", room: "Lab 103", name: "Object Oriented Programming Lab" },
      7: { isFree: false, course: "PC1", room: "Lab B05", name: "Professional Communication Lab" },
      8: { isFree: false, course: "PC1", room: "Lab B05", name: "Professional Communication Lab" }
    },
    Thursday: {
      1: { isFree: false, course: "RANAC1", room: "G09", name: "Real Analysis, Numerical Analysis & Calculus" },
      2: { isFree: true, note: "Free Slot" },
      3: { isFree: false, course: "DBMS1", room: "G06", name: "Database Management Systems" },
      4: { isFree: false, course: "OS1", room: "G04", name: "Operating System" },
      5: { isFree: true, note: "Free Slot" },
      6: { isFree: false, course: "PC1", room: "B05", name: "Professional Communication" },
      7: { isFree: false, course: "OOP1", room: "G04", name: "Object Oriented Programming" },
      8: { isFree: true, note: "Free Slot" }
    },
    Friday: {
      1: { isFree: false, course: "ADSA1", room: "LAB 103", name: "Advanced Data Structure & Algorithms Lab" },
      2: { isFree: false, course: "ADSA1", room: "LAB 103", name: "Advanced Data Structure & Algorithms Lab" },
      3: { isFree: false, course: "OS1", room: "G07", name: "Operating System" },
      4: { isFree: true, note: "Free Slot" },
      5: { isFree: false, course: "RANAC1", room: "G04", name: "Real Analysis, Numerical Analysis & Calculus" },
      6: { isFree: false, course: "DBMS1", room: "LAB 103", name: "Database Management Systems Lab" },
      7: { isFree: false, course: "DBMS1", room: "LAB 103", name: "Database Management Systems Lab" },
      8: { isFree: true, note: "Free Slot" }
    }
  },
  "CSE-2": {
    Monday: {
      1: { isFree: false, course: "PC2", room: "B05", name: "Professional Communication" },
      2: { isFree: false, course: "RANAC2", room: "G04", name: "Real Analysis, Numerical Analysis & Calculus" },
      3: { isFree: false, course: "OS2", room: "B03", name: "Operating System" },
      4: { isFree: true, note: "Free Slot" },
      5: { isFree: false, course: "DBMS2", room: "G04", name: "Database Management Systems" },
      6: { isFree: false, course: "ADSA2", room: "G05", name: "Advanced Data Structure & Algorithms" },
      7: { isFree: false, course: "OOP2", room: "Lab 103", name: "Object Oriented Programming Lab" },
      8: { isFree: false, course: "OOP2", room: "Lab 103", name: "Object Oriented Programming Lab" }
    },
    Tuesday: {
      1: { isFree: true, note: "Free Slot" },
      2: { isFree: true, note: "Free Slot" },
      3: { isFree: false, course: "OOP2", room: "G05", name: "Object Oriented Programming" },
      4: { isFree: false, course: "RANAC2", room: "G06", name: "Real Analysis, Numerical Analysis & Calculus" },
      5: { isFree: false, course: "OS2", room: "G05", name: "Operating System" },
      6: { isFree: false, course: "DBMS2", room: "G06", name: "Database Management Systems" },
      7: { isFree: false, course: "ADSA2", room: "Lab 103", name: "Advanced Data Structure & Algorithms Lab" },
      8: { isFree: false, course: "ADSA2", room: "Lab 103", name: "Advanced Data Structure & Algorithms Lab" }
    },
    Wednesday: {
      1: { isFree: false, course: "ADSA2", room: "G04", name: "Advanced Data Structure & Algorithms" },
      2: { isFree: false, course: "OS2", room: "G05", name: "Operating System" },
      3: { isFree: true, note: "Free Slot" },
      4: { isFree: true, note: "Free Slot" },
      5: { isFree: true, note: "Free Slot" },
      6: { isFree: false, course: "RANAC2", room: "G04", name: "Real Analysis, Numerical Analysis & Calculus" },
      7: { isFree: true, note: "Free Slot" },
      8: { isFree: true, note: "Free Slot" }
    },
    Thursday: {
      1: { isFree: true, note: "Free Slot" },
      2: { isFree: false, course: "OOP2", room: "G08", name: "Object Oriented Programming" },
      3: { isFree: true, note: "Free Slot" },
      4: { isFree: false, course: "OS2", room: "G05", name: "Operating System" },
      5: { isFree: true, note: "Free Slot" },
      6: { isFree: false, course: "RANAC2", room: "G04", name: "Real Analysis, Numerical Analysis & Calculus" },
      7: { isFree: false, course: "DBMS2", room: "LAB 103", name: "Database Management Systems Lab" },
      8: { isFree: false, course: "DBMS2", room: "LAB 103", name: "Database Management Systems Lab" }
    },
    Friday: {
      1: { isFree: true, note: "Free Slot" },
      2: { isFree: true, note: "Free Slot" },
      3: { isFree: false, course: "DBMS2", room: "G06", name: "Database Management Systems" },
      4: { isFree: false, course: "PC2", room: "B04", name: "Professional Communication" },
      5: { isFree: false, course: "ADSA2", room: "G07", name: "Advanced Data Structure & Algorithms" },
      6: { isFree: false, course: "OOP2", room: "G06", name: "Object Oriented Programming" },
      7: { isFree: false, course: "PC2", room: "Lab B05", name: "Professional Communication Lab" },
      8: { isFree: false, course: "PC2", room: "Lab B05", name: "Professional Communication Lab" }
    }
  },
  "CSE-3": {
    Monday: {
      1: { isFree: true, note: "Free Slot" },
      2: { isFree: true, note: "Free Slot" },
      3: { isFree: false, course: "DBMS3", room: "G07", name: "Database Management Systems" },
      4: { isFree: false, course: "OS3", room: "G06", name: "Operating System" },
      5: { isFree: false, course: "ADSA3", room: "G05", name: "Advanced Data Structure & Algorithms" },
      6: { isFree: false, course: "RANAC3", room: "G04", name: "Real Analysis, Numerical Analysis & Calculus" },
      7: { isFree: false, course: "PC3", room: "Lab B05", name: "Professional Communication Lab" },
      8: { isFree: false, course: "PC3", room: "Lab B05", name: "Professional Communication Lab" }
    },
    Tuesday: {
      1: { isFree: false, course: "RANAC3", room: "G05", name: "Real Analysis, Numerical Analysis & Calculus" },
      2: { isFree: true, note: "Free Slot" },
      3: { isFree: false, course: "OOP3", room: "Lab 103", name: "Object Oriented Programming Lab" },
      4: { isFree: false, course: "OOP3", room: "Lab 103", name: "Object Oriented Programming Lab" },
      5: { isFree: false, course: "OS3", room: "G06", name: "Operating System" },
      6: { isFree: false, course: "ADSA3", room: "G05", name: "Advanced Data Structure & Algorithms" },
      7: { isFree: false, course: "PC3", room: "B05", name: "Professional Communication" },
      8: { isFree: true, note: "Free Slot" }
    },
    Wednesday: {
      1: { isFree: false, course: "DBMS3", room: "G06", name: "Database Management Systems" },
      2: { isFree: true, note: "Free Slot" },
      3: { isFree: false, course: "ADSA3", room: "LAB 103", name: "Advanced Data Structure & Algorithms Lab" },
      4: { isFree: false, course: "ADSA3", room: "LAB 103", name: "Advanced Data Structure & Algorithms Lab" },
      5: { isFree: false, course: "OOP3", room: "G06", name: "Object Oriented Programming" },
      6: { isFree: true, note: "Free Slot" },
      7: { isFree: false, course: "DBMS3", room: "LAB 103", name: "Database Management Systems Lab" },
      8: { isFree: false, course: "DBMS3", room: "LAB 103", name: "Database Management Systems Lab" }
    },
    Thursday: {
      1: { isFree: false, course: "PC3", room: "G07", name: "Professional Communication" },
      2: { isFree: true, note: "Free Slot" },
      3: { isFree: false, course: "RANAC3", room: "G05", name: "Real Analysis, Numerical Analysis & Calculus" },
      4: { isFree: true, note: "Free Slot" },
      5: { isFree: false, course: "OOP3", room: "G05", name: "Object Oriented Programming" },
      6: { isFree: false, course: "OS3", room: "G08", name: "Operating System" },
      7: { isFree: false, course: "DBMS3", room: "G06", name: "Database Management Systems" },
      8: { isFree: true, note: "Free Slot" }
    },
    Friday: {
      1: { isFree: false, course: "RANAC3", room: "G05", name: "Real Analysis, Numerical Analysis & Calculus" },
      2: { isFree: false, course: "OS3", room: "B04", name: "Operating System" },
      3: { isFree: true, note: "Free Slot" },
      4: { isFree: false, course: "ADSA3", room: "G08", name: "Advanced Data Structure & Algorithms" },
      5: { isFree: true, note: "Free Slot" },
      6: { isFree: false, course: "OOP3", room: "G05", name: "Object Oriented Programming" },
      7: { isFree: true, note: "Free Slot" },
      8: { isFree: true, note: "Free Slot" }
    }
  },
  "CSE-4": {
    Monday: {
      1: { isFree: false, course: "OOP4", room: "G05", name: "Object Oriented Programming" },
      2: { isFree: true, note: "Free Slot" },
      3: { isFree: true, note: "Free Slot" },
      4: { isFree: true, note: "Free Slot" },
      5: { isFree: false, course: "RANAC4", room: "G09", name: "Real Analysis, Numerical Analysis & Calculus" },
      6: { isFree: false, course: "OOP4", room: "G07", name: "Object Oriented Programming" },
      7: { isFree: true, note: "Free Slot" },
      8: { isFree: true, note: "Free Slot" }
    },
    Tuesday: {
      1: { isFree: true, note: "Free Slot" },
      2: { isFree: true, note: "Free Slot" },
      3: { isFree: true, note: "Free Slot" },
      4: { isFree: false, course: "PC4", room: "G04", name: "Professional Communication" },
      5: { isFree: true, note: "Free Slot" },
      6: { isFree: true, note: "Free Slot" },
      7: { isFree: true, note: "Free Slot" },
      8: { isFree: true, note: "Free Slot" }
    },
    Wednesday: {
      1: { isFree: true, note: "Free Slot" },
      2: { isFree: false, course: "PC4", room: "B05", name: "Professional Communication" },
      3: { isFree: false, course: "RANAC4", room: "G07", name: "Real Analysis, Numerical Analysis & Calculus" },
      4: { isFree: true, note: "Free Slot" },
      5: { isFree: false, course: "OOP4", room: "G08", name: "Object Oriented Programming" },
      6: { isFree: true, note: "Free Slot" },
      7: { isFree: true, note: "Free Slot" },
      8: { isFree: true, note: "Free Slot" }
    },
    Thursday: {
      1: { isFree: false, course: "RANAC4", room: "G06", name: "Real Analysis, Numerical Analysis & Calculus" },
      2: { isFree: true, note: "Free Slot" },
      3: { isFree: true, note: "Free Slot" },
      4: { isFree: true, note: "Free Slot" },
      5: { isFree: false, course: "OOP4", room: "Lab 103", name: "Object Oriented Programming Lab" },
      6: { isFree: false, course: "OOP4", room: "Lab 103", name: "Object Oriented Programming Lab" },
      7: { isFree: true, note: "Free Slot" },
      8: { isFree: true, note: "Free Slot" }
    },
    Friday: {
      1: { isFree: false, course: "PC4", room: "Lab B05", name: "Professional Communication Lab" },
      2: { isFree: false, course: "PC4", room: "Lab B05", name: "Professional Communication Lab" },
      3: { isFree: true, note: "Free Slot" },
      4: { isFree: true, note: "Free Slot" },
      5: { isFree: true, note: "Free Slot" },
      6: { isFree: false, course: "RANAC4", room: "G04", name: "Real Analysis, Numerical Analysis & Calculus" },
      7: { isFree: true, note: "Free Slot" },
      8: { isFree: true, note: "Free Slot" }
    }
  },
  "ECE": {
    Monday: {
      1: { isFree: true, note: "Free Slot" },
      2: { isFree: false, course: "CS", room: "B03", name: "Control Systems" },
      3: { isFree: false, course: "CNA", room: "G06", name: "Circuits and Network Analysis" },
      4: { isFree: false, course: "ML", room: "109", name: "Machine Learning" },
      5: { isFree: true, note: "Free Slot" },
      6: { isFree: true, note: "Free Slot" },
      7: { isFree: true, note: "Free Slot" },
      8: { isFree: true, note: "Free Slot" }
    },
    Tuesday: {
      1: { isFree: false, course: "CNA", room: "G06", name: "Circuits and Network Analysis" },
      2: { isFree: false, course: "CS", room: "G05", name: "Control Systems" },
      3: { isFree: true, note: "Free Slot" },
      4: { isFree: true, note: "Free Slot" },
      5: { isFree: false, course: "ML", room: "108", name: "Machine Learning" },
      6: { isFree: false, course: "ES", room: "LAB 114/102", name: "Embedded Systems Lab" },
      7: { isFree: false, course: "ES", room: "LAB 114/102", name: "Embedded Systems Lab" },
      8: { isFree: true, note: "Free Slot" }
    },
    Wednesday: {
      1: { isFree: false, course: "CS", room: "G05", name: "Control Systems" },
      2: { isFree: false, course: "ML", room: "108", name: "Machine Learning" },
      3: { isFree: true, note: "Free Slot" },
      4: { isFree: true, note: "Free Slot" },
      5: { isFree: true, note: "Free Slot" },
      6: { isFree: false, course: "ES", room: "G07", name: "Embedded Systems" },
      7: { isFree: true, note: "Free Slot" },
      8: { isFree: true, note: "Free Slot" }
    },
    Thursday: {
      1: { isFree: true, note: "Free Slot" },
      2: { isFree: false, course: "CNA", room: "G06", name: "Circuits and Network Analysis" },
      3: { isFree: false, course: "CNA", room: "Lab 114/102", name: "Circuits & Network Analysis Lab" },
      4: { isFree: false, course: "CNA / ML", room: "Lab 114 / 111", name: "Circuits Lab / Machine Learning" },
      5: { isFree: true, note: "Free Slot" },
      6: { isFree: true, note: "Free Slot" },
      7: { isFree: false, course: "CS", room: "G09", name: "Control Systems" },
      8: { isFree: true, note: "Free Slot" }
    },
    Friday: {
      1: { isFree: true, note: "Free Slot" },
      2: { isFree: true, note: "Free Slot" },
      3: { isFree: false, course: "ES", room: "B03", name: "Embedded Systems" },
      4: { isFree: true, note: "Free Slot" },
      5: { isFree: false, course: "ES", room: "G06", name: "Embedded Systems" },
      6: { isFree: true, note: "Free Slot" },
      7: { isFree: true, note: "Free Slot" },
      8: { isFree: true, note: "Free Slot" }
    }
  }
};
