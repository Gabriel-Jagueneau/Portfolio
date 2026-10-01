/**
 * Dynamic Dates & Timeline Progression
 * Automates age calculation, academic level at Bordeaux Sciences Agro,
 * coding experience, and timeline active statuses.
 */

export const PROFILE_CONFIG = {
  // Birth date: 14 September 2005
  birthDate: new Date(2005, 8, 14),

  // Academic milestones
  schoolStartYear: 2025, // Enrolled at Bordeaux Sciences Agro
  schoolEndYear: 2028,   // Planned graduation year
  schoolStartMonth: 8,   // September (0-indexed: 8)

  // Experience start dates
  codingStartYear: 2019, // Starblast.io / JavaScript
  webDevStartYear: 2022  // Web development
};

/**
 * Calculates current age accurately based on day and month.
 */
export function calculateAge(birthDate = PROFILE_CONFIG.birthDate, now = new Date()) {
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Calculates current academic status at Bordeaux Sciences Agro.
 * Academic year switches in September.
 */
export function getAcademicStatus(now = new Date()) {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Academic year start: if month is Sept (8) or later, it's currentYear, else currentYear - 1
  const academicYear = currentMonth >= PROFILE_CONFIG.schoolStartMonth ? currentYear : currentYear - 1;
  const yearOffset = academicYear - PROFILE_CONFIG.schoolStartYear + 1;

  // Already graduated (after Sept 2028 or mid-2028 graduation)
  if (academicYear >= PROFILE_CONFIG.schoolEndYear) {
    return {
      title: "Agronomy Engineer",
      quickDesc: "Agronomy Engineer, Student-Entrepreneur and Multi-stack developer",
      levelDesc: "Graduate Agronomy Engineer (Master of Science equivalent).",
      shortStatus: "Engineer",
      isGraduated: true,
      currentYearOfStudy: 5
    };
  }

  // Pre-engineering school (before 2025)
  if (yearOffset < 1) {
    return {
      title: "Biology Prep Student",
      quickDesc: "Future Agronomy Engineer, Student-Entrepreneur and Multi-stack developer",
      levelDesc: "My level in these domains is Equivalent of a Biology undergraduate 2nd year student.",
      shortStatus: "Prep student",
      isGraduated: false,
      currentYearOfStudy: 2
    };
  }

  // 1st year (2025-2026): Equivalent Bac+3 / L3
  if (yearOffset === 1) {
    return {
      title: "Future Agronomy Engineer (1st yr)",
      quickDesc: "Future Agronomy Engineer, Student-Entrepreneur and Multi-stack developer",
      levelDesc: "My level in these domains is Equivalent of a Biology undergraduate 3rd year / 1st year Engineering student.",
      shortStatus: "1st year",
      isGraduated: false,
      currentYearOfStudy: 3
    };
  }

  // 2nd year (2026-2027): Equivalent Bac+4 / Master 1
  if (yearOffset === 2) {
    return {
      title: "Future Agronomy Engineer (2nd yr)",
      quickDesc: "Future Agronomy Engineer, Student-Entrepreneur and Multi-stack developer",
      levelDesc: "My level in these domains is Equivalent of a Master 1 / 2nd year Engineering student.",
      shortStatus: "2nd year",
      isGraduated: false,
      currentYearOfStudy: 4
    };
  }

  // 3rd / Final year (2027-2028): Equivalent Bac+5 / Master 2
  return {
    title: "Future Agronomy Engineer (Final yr)",
    quickDesc: "Future Agronomy Engineer, Student-Entrepreneur and Multi-stack developer",
    levelDesc: "My level in these domains is Equivalent of a Master 2 / Final year Engineering student.",
    shortStatus: "Final year",
    isGraduated: false,
    currentYearOfStudy: 5
  };
}

/**
 * Calculates years of coding / development experience.
 */
export function getExperienceYears(startYear, now = new Date()) {
  return Math.max(1, now.getFullYear() - startYear);
}

/**
 * Updates timeline items according to current year (past, current, future).
 */
export function updateTimeline(now = new Date()) {
  const currentYear = now.getFullYear();
  const timelineNodes = document.querySelectorAll('#about .parags .inner');

  timelineNodes.forEach((node) => {
    const dateEl = node.querySelector('.date');
    if (!dateEl) return;

    const year = parseInt(dateEl.textContent.trim(), 10);
    if (isNaN(year)) return;

    node.classList.remove('timeline-past', 'timeline-current', 'timeline-future');

    if (year < currentYear) {
      node.classList.add('timeline-past');
    } else if (year === currentYear) {
      node.classList.add('timeline-current');
      dateEl.setAttribute('title', 'Current Year');
    } else {
      node.classList.add('timeline-future');
      dateEl.setAttribute('title', 'Upcoming');
    }
  });
}

/**
 * Initializes all dynamic dates across the page.
 */
export function initDynamicDates() {
  const now = new Date();
  const age = calculateAge(PROFILE_CONFIG.birthDate, now);
  const academic = getAcademicStatus(now);
  const codingYears = getExperienceYears(PROFILE_CONFIG.codingStartYear, now);
  const webDevYears = getExperienceYears(PROFILE_CONFIG.webDevStartYear, now);

  // Update elements by ID if present
  const ageEl = document.getElementById('dynamic-user-age');
  if (ageEl) ageEl.textContent = `${age}`;

  const academicLevelEl = document.getElementById('dynamic-student-level');
  if (academicLevelEl) academicLevelEl.textContent = academic.levelDesc;

  const engineerStatusEl = document.getElementById('dynamic-engineer-status');
  if (engineerStatusEl) engineerStatusEl.textContent = academic.title;

  const codingExpEl = document.getElementById('dynamic-coding-exp');
  if (codingExpEl) codingExpEl.textContent = `${codingYears}+ yrs`;

  const webExpEl = document.getElementById('dynamic-web-exp');
  if (webExpEl) webExpEl.textContent = `${webDevYears}+ yrs`;

  const currentYearEls = document.querySelectorAll('.dynamic-current-year');
  currentYearEls.forEach(el => {
    el.textContent = `${now.getFullYear()}`;
  });

  // Also support data-dynamic attribute for maximum flexibility
  document.querySelectorAll('[data-dynamic]').forEach((el) => {
    const key = el.getAttribute('data-dynamic');
    switch (key) {
      case 'age':
        el.textContent = `${age}`;
        break;
      case 'student-level':
        el.textContent = academic.levelDesc;
        break;
      case 'engineer-status':
        el.textContent = academic.title;
        break;
      case 'coding-exp':
        el.textContent = `${codingYears}+ yrs`;
        break;
      case 'web-exp':
        el.textContent = `${webDevYears}+ yrs`;
        break;
      case 'current-year':
        el.textContent = `${now.getFullYear()}`;
        break;
    }
  });

  // Update timeline visual cues
  updateTimeline(now);
}
