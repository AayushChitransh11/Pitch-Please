export type CoverageStatus = "covered" | "partial" | "missing";

export const sampleConversation = [
  { role: "coach" as const, text: "Who is your audience, and what should they remember?" },
  { role: "student" as const, text: "Hackathon judges. I want them to understand how our app helps students find campus events." },
  { role: "coach" as const, text: "Let’s organize your presentation around the problem, your solution, a short demo, and the benefit to students." },
];

export const sampleResults = {
  duration: "2:42",
  limit: "3:00",
  durationRatio: 162 / 180,
  wpm: 132,
  checklist: [
    { point: "Problem", status: "covered" as CoverageStatus },
    { point: "Solution", status: "covered" as CoverageStatus },
    { point: "Demo", status: "partial" as CoverageStatus },
    { point: "Student benefit", status: "missing" as CoverageStatus },
  ],
  nextStep: "Add one concrete example of how a student benefits before you close.",
};
