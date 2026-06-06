import { executeAICompletion, AIResponse } from './aiDispatcher.js';

/**
 * 1. Explain the entire repository structures and details
 */
export async function explainRepository(
  projectName: string,
  description: string,
  techStack: string[],
  folderStructure: any,
  model = 'gemini-2.5-pro'
): Promise<AIResponse> {
  const systemPrompt = 'You are a Senior Staff Engineer. Provide an in-depth code architecture explanation of the repository.';
  const userPrompt = `Project Name: ${projectName}\nDescription: ${description}\nTech Stack: ${JSON.stringify(techStack)}\nFolder Structure: ${JSON.stringify(folderStructure)}\n\nAnalyze this repository structural tree and explain the overall layout, framework choices, design patterns, and recommendations for improving developer velocity.`;

  return executeAICompletion(model, [{ role: 'user', content: userPrompt }], systemPrompt);
}

/**
 * 2. Explain a single code module
 */
export async function explainFile(
  filePath: string,
  fileContent: string,
  repositoryContext = '',
  model = 'gemini-2.5-pro'
): Promise<AIResponse> {
  const systemPrompt = 'You are a Principal Software Engineer. Conduct a line-by-line semantic module review.';
  const userPrompt = `File Path: ${filePath}\n\nRepository Context:\n${repositoryContext}\n\nFile Content:\n\`\`\`\n${fileContent}\n\`\`\`\n\nExplain the purpose of this file, summarize what the code does, rate its importance, and analyze its function intelligence.`;

  return executeAICompletion(model, [{ role: 'user', content: userPrompt }], systemPrompt);
}

/**
 * 3. Review overall repository architecture graphs
 */
export async function reviewArchitecture(
  nodes: any[],
  edges: any[],
  repositoryContext = '',
  model = 'gemini-2.5-pro'
): Promise<AIResponse> {
  const systemPrompt = 'You are an Enterprise System Architect. Audit codebase topologies for performance bottlenecks, dependencies risk, and layout flaws.';
  const userPrompt = `Architecture Nodes:\n${JSON.stringify(nodes)}\n\nArchitecture Edges:\n${JSON.stringify(edges)}\n\nRepository Context:\n${repositoryContext}\n\nReview this system architecture layout. Detect hotspots, database locks, tight couplings, and provide a detailed modularization roadmap.`;

  return executeAICompletion(model, [{ role: 'user', content: userPrompt }], systemPrompt);
}

/**
 * 4. Audit codebase security vulnerabilities
 */
export async function reviewSecurity(
  vulnerabilities: any[],
  repositoryContext = '',
  model = 'gemini-2.5-pro'
): Promise<AIResponse> {
  const systemPrompt = 'You are a Senior Security Auditor and CVSS Assessor. Audit codebases against OWASP Top 10 vulnerabilities.';
  const userPrompt = `Discovered Static Vulnerabilities:\n${JSON.stringify(vulnerabilities)}\n\nRepository Context:\n${repositoryContext}\n\nAssess these security warnings. Rate their severity, describe the impact vectors, and provide specific code fixes to resolve these loopholes.`;

  return executeAICompletion(model, [{ role: 'user', content: userPrompt }], systemPrompt);
}

/**
 * 5. Generate test code suites
 */
export async function generateTests(
  code: string,
  language: string,
  testType: string,
  model = 'gemini-2.5-pro'
): Promise<AIResponse> {
  const systemPrompt = 'You are a Senior Quality Assurance Engineer. Generate only clean, executable test suites without explanations or markdown backticks.';
  const userPrompt = `Generate a ${testType} test suite for the following ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;

  return executeAICompletion(model, [{ role: 'user', content: userPrompt }], systemPrompt);
}

/**
 * 6. Generate markdown guides and developer guidelines
 */
export async function generateDocumentation(
  docType: string,
  projectName: string,
  description: string,
  techStack: string[],
  filesSummary: string,
  model = 'gemini-2.5-pro'
): Promise<AIResponse> {
  const systemPrompt = 'You are a Senior Technical Writer. Compose clean, professional markdown guides with tables, curl examples, and warning badges.';
  
  let prompt = `Generate a ${docType} guide for the project "${projectName}" (${description}).\nTech Stack: ${JSON.stringify(techStack)}\nFiles:\n${filesSummary}\n`;
  if (docType === 'README') {
    prompt += 'Provide sections: Introduction, Quick Start, Features, Project Structure, and License.';
  } else if (docType === 'API') {
    prompt += 'Provide REST API documentation with sample endpoints, payload formats, and curl requests.';
  } else {
    prompt += 'Provide installation guidelines, requirements setups, and developer troubleshooting steps.';
  }

  return executeAICompletion(model, [{ role: 'user', content: prompt }], systemPrompt);
}

/**
 * 7. Generate refactored code variations
 */
export async function generateRefactorPlan(
  code: string,
  language: string,
  model = 'gemini-2.5-pro'
): Promise<AIResponse> {
  const systemPrompt = 'You are a Principal Software Architect. Rewrite the provided code to match clean design metrics. Return ONLY the code block.';
  const userPrompt = `Refactor this ${language} code block for clarity, memory efficiency, and exceptions handling:\n\n${code}`;

  return executeAICompletion(model, [{ role: 'user', content: userPrompt }], systemPrompt);
}
