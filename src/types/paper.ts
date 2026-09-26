export interface StudentProjectIdea {
  id: string;
  title: string;
  exactExtension: string;
  targetedPerformanceMetric: string;
  recommendedTechStack: string[];
  difficultyLevel: 'Intermediate' | 'Advanced';
  estimatedTimelineWeeks: number;
  weeklyRoadmap: string[];
  interviewTalkingPoint: string;
  starterCodeSnippet: string;
  hardwareRequirements: string;
}

export interface CoreConceptExtraction {
  problemStatement: string;
  methodology: string;
  mathematicalBreakthroughs: string;
  summaryText: string;
  wordCount: number;
}

export interface PaperAnalysis {
  paperTitle: string;
  authors: string[];
  year: string;
  venueOrArxiv: string;
  url: string;
  oneLineHook: string;
  coreConcept: CoreConceptExtraction;
  mermaidFlowchart: string;
  futureWorkAndInternships: StudentProjectIdea[];
  systemArchitectureNotes: {
    inputs: string[];
    layers: string[];
    outputs: string[];
    computationalComplexity: string;
  };
  searchSources?: Array<{ title?: string; uri?: string }>;
  tokenAudit: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    tokenLimit: number;
    tokenEfficiencyScore: string;
    durationMs: number;
  };
}

export interface ProjectScaffold {
  projectName: string;
  readmeMarkdown: string;
  fileTree: string[];
  modelCode: string;
  benchmarkCode: string;
  requirementsTxt: string;
}
