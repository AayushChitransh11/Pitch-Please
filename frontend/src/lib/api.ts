// API service boundary. All network calls go through here so switching from
// sample data to the real backend (AWS/Azure, owned by teammates) is one change.

export type PresentationBrief = {
  topic: string;
  audience: string;
  purpose: string;
  targetSeconds: number;
  requiredPoints: string[];
  draftText?: string;
};

// Matches the agreed team contract: POST /api/sessions -> 201 { sessionId }.
// The backend is built elsewhere; until it is connected we keep the brief
// locally and return a temporary session id.
export async function createSession(
  brief: PresentationBrief,
): Promise<{ sessionId: string; brief: PresentationBrief }> {
  const sessionId = `local-${Date.now().toString(36)}`;
  return { sessionId, brief };
}

// Contract for practice analysis results (GET /api/practice/:id, completed).
export type CoverageStatus = "covered" | "partial" | "missing" | "uncertain";

export type PracticeResults = {
  measurements: {
    durationSeconds: number;
    targetSeconds: number;
    wordCount: number;
    wordsPerMinute: number;
  };
  coverage: { point: string; status: CoverageStatus; evidence: string | null }[];
  strengths: string[];
  improvements: {
    category: string;
    priority: number;
    observation: string;
    suggestion: string;
  }[];
  transcript: string;
};

// Sample result from the team spec, used until the practice endpoint is live.
export async function getSampleResults(): Promise<PracticeResults> {
  return {
    measurements: {
      durationSeconds: 162,
      targetSeconds: 180,
      wordCount: 356,
      wordsPerMinute: 132,
    },
    coverage: [
      {
        point: "The problem students face",
        status: "covered",
        evidence: "Students miss events because information is scattered.",
      },
      {
        point: "How our application solves it",
        status: "covered",
        evidence: "Our app gathers every campus event in one feed.",
      },
      {
        point: "A working demonstration",
        status: "partial",
        evidence: "The demo was mentioned but not shown end to end.",
      },
      {
        point: "The benefit to students",
        status: "missing",
        evidence: null,
      },
    ],
    strengths: [
      "Your opening clearly identifies who experiences the problem.",
      "You explain the solution in plain language that suits the judges.",
    ],
    improvements: [
      {
        category: "content",
        priority: 1,
        observation: "The benefit to students is not explained.",
        suggestion: "Add a concrete example of how a student benefits before closing.",
      },
      {
        category: "organization",
        priority: 2,
        observation: "Your conclusion needs a takeaway.",
        suggestion: "End with one clear sentence the judges will remember.",
      },
    ],
    transcript:
      "Today I will explain our campus event app. Students miss events because information is scattered across group chats and notice boards. Our app gathers every campus event in one feed, so students can see what is happening today at a glance. Let me walk you through how it works...",
  };
}
