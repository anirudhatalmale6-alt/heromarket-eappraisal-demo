/* DUMMY staff data only — no real employee PII. Schema mirrors the real
   "Profile - Employee Info" export so auto-fill maps 1:1 in production. */
window.EMPLOYEES = [
  {
    empNo: "L010792", name: "Nabila Rahman", position: "Cashier",
    department: "Kampung Baru Puchong", outlet: "KBP", dateJoined: "2026-01-06",
    confirmDue: "2026-04-05", grade: "Support Staff", level: "support",
    superiorName: "Firas Hamizan", superiorNo: "L007298", basicSalary: 1700,
    confirmationStatus: "PROB"
  },
  {
    empNo: "L010793", name: "Letchumanan Shanker", position: "Cashier",
    department: "All Season Penang", outlet: "ASP", dateJoined: "2026-01-06",
    confirmDue: "2026-04-05", grade: "Support Staff", level: "support",
    superiorName: "Wong Bee Ling", superiorNo: "L007082", basicSalary: 1700,
    confirmationStatus: "PROB"
  },
  {
    empNo: "L009120", name: "Aisyah Kamal", position: "Store Supervisor",
    department: "Section 13 Shah Alam", outlet: "H029", dateJoined: "2025-08-11",
    confirmDue: "2026-02-10", grade: "Supervisor", level: "supervisor",
    superiorName: "Usain Omar", superiorNo: "L000015", basicSalary: 2900,
    confirmationStatus: "PROB"
  },
  {
    empNo: "L009884", name: "Daniel Tan", position: "E-Commerce Executive",
    department: "Kota Kemuning", outlet: "KK", dateJoined: "2025-11-08",
    confirmDue: "2026-05-07", grade: "Support Staff", level: "support",
    superiorName: "Mon Chee Hoong", superiorNo: "L002436", basicSalary: 2100,
    confirmationStatus: "PROB"
  },
  {
    empNo: "L008745", name: "Priya Devan", position: "Outlet Manager",
    department: "All Season Penang", outlet: "ASP", dateJoined: "2025-07-01",
    confirmDue: "2026-01-01", grade: "Supervisor", level: "supervisor",
    superiorName: "Kenny Tang", superiorNo: "L000001", basicSalary: 4200,
    confirmationStatus: "PROB"
  }
];

/* The 10 performance dimensions from the Staff Appraisal Form (HRD 07/2020).
   supervisorOnly items (8,9,10) only count toward the /100 supervisor scale. */
window.DIMENSIONS = [
  { n: 1, key: "knowledge", title: "Knowledge & Skill of Job",
    q: "Possesses excellent knowledge of own job and related areas, produces work of outstanding standard, and applies management/technical knowledge on the job?" },
  { n: 2, key: "planning", title: "Planning",
    q: "Ability to plan the use of resources, and develop and prioritise plans, programmes and budgets to achieve goals?" },
  { n: 3, key: "organising", title: "Organising",
    q: "Ability to organise, coordinate and structure resources and delegate job tasks effectively to reach an objective?" },
  { n: 4, key: "communications", title: "Communications",
    q: "Ability to listen effectively and express ideas clearly in writing and speech with subordinates, peers, superiors and external contacts?" },
  { n: 5, key: "commitment", title: "Commitment",
    q: "Willingness and perseverance in getting the job done, and responsibility towards the job, work team and company?" },
  { n: 6, key: "independence", title: "Independence",
    q: "Ability to exercise self-direction and resourcefulness in executing work plans with minimum supervision?" },
  { n: 7, key: "quality", title: "Quality",
    q: "Ability to maintain accuracy, thoroughness, neatness and acceptability in products and results as per set standards?" },
  { n: 8, key: "leadership", title: "Leadership", supervisorOnly: true,
    q: "Ability in motivating, influencing and impelling others to effective action towards achieving results?" },
  { n: 9, key: "developing", title: "Developing Subordinates", supervisorOnly: true,
    q: "Demonstrates commitment to develop subordinates through coaching, counselling and on-the-job training?" },
  { n: 10, key: "delegation", title: "Delegation", supervisorOnly: true,
    q: "Ability in distributing work and assigning responsibility to subordinates, with constructive follow-up?" }
];

/* Overall rating bands (percentage). */
window.RATING_BANDS = [
  { min: 90, max: 100, label: "Excellent",      remark: "Consistently exceed requirements", cls: "b-excellent" },
  { min: 80, max: 89,  label: "Good",           remark: "Frequently exceed requirements",   cls: "b-good" },
  { min: 70, max: 79,  label: "Above Average",  remark: "Consistently meet requirements",   cls: "b-above" },
  { min: 50, max: 69,  label: "Average",        remark: "Meets requirements",               cls: "b-avg" },
  { min: 30, max: 49,  label: "Below Average",  remark: "Needs improvement",                cls: "b-below" },
  { min: 0,  max: 29,  label: "Very Poor",      remark: "Does not meet requirements",       cls: "b-poor" }
];

/* Multi-level approval chain. In production the approver names auto-route from
   the employee "Superior" field up the org hierarchy. */
window.APPROVAL_STEPS = [
  { key: "appraiser", title: "Appraiser", who: "Immediate Superior", desc: "Rates performance & recommends action" },
  { key: "appraisee", title: "Appraisee", who: "Staff Member",       desc: "Acknowledges & comments" },
  { key: "depthead",  title: "Dept Head", who: "Verifier",           desc: "Verifies the appraisal" },
  { key: "director",  title: "Director",  who: "Approver",           desc: "Final approval" }
];
