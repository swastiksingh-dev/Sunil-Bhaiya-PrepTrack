/** Curriculum data — NCERT chapter lists + Class 10 resource catalogue.
 * Single interface: getSubjects(grade), plus the PDF catalogue and PYQ portal URL.
 * Ported 1:1 from the original local dataset (counts: C10 Sci 13 / Maths 14 /
 * SST 22 = H5+G7+C5+E5; C9 Sci 13 / Maths 8 / SST 9 across 5 groups). */

export interface Chapter {
  id: string;
  no: number;
  name: string;
}

export interface ChapterGroup {
  id: string;
  name: string | null;
  chapters: Chapter[];
}

export interface Subject {
  id: string;
  name: string;
  examKey: "science" | "maths" | "sst";
  groups: ChapterGroup[];
}

export interface PdfResource {
  title: string;
  path: string;
}

const CLASS_10: Subject[] = [
  {
    id: "science",
    name: "Science",
    examKey: "science",
    groups: [
      {
        id: "science",
        name: null,
        chapters: [
          { id: "ch1", no: 1, name: "Chemical Reactions and Equations" },
          { id: "ch2", no: 2, name: "Acids, Bases and Salts" },
          { id: "ch3", no: 3, name: "Metals and Non-metals" },
          { id: "ch4", no: 4, name: "Carbon and its Compounds" },
          { id: "ch5", no: 5, name: "Life Processes" },
          { id: "ch6", no: 6, name: "Control and Coordination" },
          { id: "ch7", no: 7, name: "How do Organisms Reproduce?" },
          { id: "ch8", no: 8, name: "Heredity" },
          { id: "ch9", no: 9, name: "Light – Reflection and Refraction" },
          { id: "ch10", no: 10, name: "Human Eye and Colourful World" },
          { id: "ch11", no: 11, name: "Electricity" },
          { id: "ch12", no: 12, name: "Magnetic Effects of Electric Current" },
          { id: "ch13", no: 13, name: "Our Environment" },
        ],
      },
    ],
  },
  {
    id: "maths",
    name: "Mathematics",
    examKey: "maths",
    groups: [
      {
        id: "maths",
        name: null,
        chapters: [
          { id: "ch1", no: 1, name: "Real Numbers" },
          { id: "ch2", no: 2, name: "Polynomials" },
          { id: "ch3", no: 3, name: "Pair of Linear Equations in Two Variables" },
          { id: "ch4", no: 4, name: "Quadratic Equations" },
          { id: "ch5", no: 5, name: "Arithmetic Progressions" },
          { id: "ch6", no: 6, name: "Triangles" },
          { id: "ch7", no: 7, name: "Coordinate Geometry" },
          { id: "ch8", no: 8, name: "Introduction to Trigonometry" },
          { id: "ch9", no: 9, name: "Some Applications of Trigonometry" },
          { id: "ch10", no: 10, name: "Circles" },
          { id: "ch11", no: 11, name: "Areas Related to Circles" },
          { id: "ch12", no: 12, name: "Surface Areas and Volumes" },
          { id: "ch13", no: 13, name: "Statistics" },
          { id: "ch14", no: 14, name: "Probability" },
        ],
      },
    ],
  },
  {
    id: "sst",
    name: "Social Science",
    examKey: "sst",
    groups: [
      {
        id: "history",
        name: "History",
        chapters: [
          { id: "hist_ch1", no: 1, name: "The Rise of Nationalism in Europe" },
          { id: "hist_ch2", no: 2, name: "Nationalism in India" },
          { id: "hist_ch3", no: 3, name: "The Making of a Global World" },
          { id: "hist_ch4", no: 4, name: "The Age of Industrialisation" },
          { id: "hist_ch5", no: 5, name: "Print Culture and the Modern World" },
        ],
      },
      {
        id: "geography",
        name: "Geography",
        chapters: [
          { id: "geo_ch1", no: 1, name: "Resources and Development" },
          { id: "geo_ch2", no: 2, name: "Forest and Wildlife Resources" },
          { id: "geo_ch3", no: 3, name: "Water Resources" },
          { id: "geo_ch4", no: 4, name: "Agriculture" },
          { id: "geo_ch5", no: 5, name: "Minerals and Energy Resources" },
          { id: "geo_ch6", no: 6, name: "Manufacturing Industries" },
          { id: "geo_ch7", no: 7, name: "Life Lines of National Economy" },
        ],
      },
      {
        id: "civics",
        name: "Political Science (Civics)",
        chapters: [
          { id: "pol_ch1", no: 1, name: "Power Sharing" },
          { id: "pol_ch2", no: 2, name: "Federalism" },
          { id: "pol_ch3", no: 3, name: "Gender, Religion and Caste" },
          { id: "pol_ch4", no: 4, name: "Political Parties" },
          { id: "pol_ch5", no: 5, name: "Outcomes of Democracy" },
        ],
      },
      {
        id: "economics",
        name: "Economics",
        chapters: [
          { id: "eco_ch1", no: 1, name: "Development" },
          { id: "eco_ch2", no: 2, name: "Sectors of the Indian Economy" },
          { id: "eco_ch3", no: 3, name: "Money and Credit" },
          { id: "eco_ch4", no: 4, name: "Globalisation and the Indian Economy" },
          { id: "eco_ch5", no: 5, name: "Consumer Rights" },
        ],
      },
    ],
  },
];

const CLASS_9: Subject[] = [
  {
    id: "science",
    name: "Science",
    examKey: "science",
    groups: [
      {
        id: "science",
        name: null,
        chapters: [
          { id: "ch1", no: 1, name: "Exploration: Entering the World of Secondary Science" },
          { id: "ch2", no: 2, name: "Cell: The Building Block of Life" },
          { id: "ch3", no: 3, name: "Tissues in Action" },
          { id: "ch4", no: 4, name: "Describing Motion Around Us" },
          { id: "ch5", no: 5, name: "Exploring Mixtures and their Separation" },
          { id: "ch6", no: 6, name: "How Forces Affect Motion" },
          { id: "ch7", no: 7, name: "Work, Energy, and Simple Machines" },
          { id: "ch8", no: 8, name: "Journey Inside the Atom" },
          { id: "ch9", no: 9, name: "Atomic Foundations of Matter" },
          { id: "ch10", no: 10, name: "Sound Waves: Characteristics and Applications" },
          { id: "ch11", no: 11, name: "Reproduction: How Life Continues" },
          { id: "ch12", no: 12, name: "Patterns in Life: Diversity and Classification" },
          { id: "ch13", no: 13, name: "Earth as a System: Energy, Matter, and Life" },
        ],
      },
    ],
  },
  {
    id: "maths",
    name: "Mathematics",
    examKey: "maths",
    groups: [
      {
        id: "maths",
        name: null,
        chapters: [
          { id: "ch1", no: 1, name: "Orienting Yourself: The Use of Coordinates" },
          { id: "ch2", no: 2, name: "Introduction to Linear Polynomials" },
          { id: "ch3", no: 3, name: "The World of Numbers" },
          { id: "ch4", no: 4, name: "Exploring Algebraic Identities" },
          { id: "ch5", no: 5, name: "I'm Up and Down, and Round and Round" },
          { id: "ch6", no: 6, name: "Measuring Space: Perimeter and Area" },
          { id: "ch7", no: 7, name: "The Mathematics of Maybe: Introduction to Probability" },
          { id: "ch8", no: 8, name: "Predicting What Comes Next: Exploring Sequences and Progressions" },
        ],
      },
    ],
  },
  {
    id: "sst",
    name: "Social Science",
    examKey: "sst",
    groups: [
      {
        id: "intro",
        name: null,
        chapters: [{ id: "ch1", no: 1, name: "Understanding Social Science" }],
      },
      {
        id: "geography",
        name: "Geography",
        chapters: [
          { id: "ch2", no: 2, name: "Shaping of the Earth's Surface" },
          { id: "ch3", no: 3, name: "Atmosphere and Climate" },
        ],
      },
      {
        id: "history",
        name: "History",
        chapters: [
          { id: "ch4", no: 4, name: "Early Humans and Beginning of Civilisation" },
          { id: "ch5", no: 5, name: "State and Society up to 1000 CE" },
        ],
      },
      {
        id: "polsci",
        name: "Political Science",
        chapters: [
          { id: "ch6", no: 6, name: "Democracy" },
          { id: "ch7", no: 7, name: "Elections" },
        ],
      },
      {
        id: "economics",
        name: "Economics",
        chapters: [
          { id: "ch8", no: 8, name: "Building Blocks in Economics: The Problem of Choice" },
          { id: "ch9", no: 9, name: "The Price Puzzle: What Drives the Market" },
        ],
      },
    ],
  },
];

export function getSubjects(grade: number): Subject[] {
  return grade === 9 ? CLASS_9 : CLASS_10;
}

/** Scoped chapter id — Class 10 SST chapters are namespaced by group so
 *  History/Geography/Civics/Economics numbers never collide. */
export function scopedChapterId(
  subjectId: string,
  groupId: string,
  chapterId: string,
  grade: number,
): string {
  if (grade === 10 && subjectId === "sst" && groupId) return `${groupId}.${chapterId}`;
  return chapterId;
}

export const CLASS_10_RESOURCES: Record<string, PdfResource[]> = {
  science: [
    { title: "Competency Focused Practice Questions — Vol 1", path: "/pdfs/class10/science/cfpq-vol1.pdf" },
    { title: "Competency Focused Practice Questions — Vol 2", path: "/pdfs/class10/science/cfpq-vol2.pdf" },
  ],
  maths: [
    { title: "Competency Focused Practice Questions — Vol 1", path: "/pdfs/class10/maths/cfpq-vol1.pdf" },
    { title: "Competency Focused Practice Questions — Vol 2", path: "/pdfs/class10/maths/cfpq-vol2.pdf" },
    { title: "Competency Focused Practice Questions — Vol 3", path: "/pdfs/class10/maths/cfpq-vol3.pdf" },
    { title: "Competency Focused Practice Questions — Vol 4", path: "/pdfs/class10/maths/cfpq-vol4.pdf" },
  ],
  sst: [
    { title: "Competency Focused Practice Questions — Vol 1", path: "/pdfs/class10/sst/cfpq-vol1.pdf" },
    { title: "Competency Focused Practice Questions — Vol 2", path: "/pdfs/class10/sst/cfpq-vol2.pdf" },
  ],
};

export const CBSE_PYQ_PORTAL_URL = "https://www.cbse.gov.in/cbsenew/question-paper.html";
