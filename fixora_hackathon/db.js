const STORAGE_KEY = "fixora_problems_v1";

const seedProblems = [
  {
    id: 1,
    title: "Street light not working",
    category: "civic",
    reporter: "Aman Verma",
    solvedByYou: true,
    description: "The street light near sector 12 market has been off for 5 days.",
    createdAt: Date.now() - 86400000
  },
  {
    id: 2,
    title: "College website login issue",
    category: "tech",
    reporter: "Sara Khan",
    solvedByYou: false,
    description: "Students cannot log in to the attendance portal after password reset.",
    createdAt: Date.now() - 56000000
  },
  {
    id: 3,
    title: "Water leakage in apartment block",
    category: "everyday",
    reporter: "Rohit Das",
    solvedByYou: true,
    description: "Continuous leakage from the overhead tank in B-block.",
    createdAt: Date.now() - 22000000
  }
];

function readProblems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedProblems));
    return [...seedProblems];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...seedProblems];
  } catch (_error) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedProblems));
    return [...seedProblems];
  }
}

function writeProblems(problems) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
}

export const ProblemApi = {
  getProblems() {
    return readProblems().sort((a, b) => b.createdAt - a.createdAt);
  },

  addProblem({ description, category, reporter = "Anonymous" }) {
    const text = String(description || "").trim();
    if (!text) {
      throw new Error("Problem description is required.");
    }

    const title = text.length > 55 ? `${text.slice(0, 55)}...` : text;
    const problems = readProblems();
    const nextId = problems.length ? Math.max(...problems.map((item) => item.id)) + 1 : 1;

    const newProblem = {
      id: nextId,
      title,
      category: category || "everyday",
      reporter,
      solvedByYou: false,
      description: text,
      createdAt: Date.now()
    };

    problems.push(newProblem);
    writeProblems(problems);
    return newProblem;
  }
};
