import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { executeAICompletion } from '../services/providers/aiDispatcher.js';

const router = Router();

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { code, language, provider } = req.body;
  if (!code) return res.status(400).json({ error: 'code is required' });

  const selectedLang = language || 'JavaScript';
  const selectedProvider = provider || 'gemini-2.5-pro';

  try {
    const responseData: Record<string, string> = {
      clean: '',
      optimized: '',
      secure: '',
      bestPractice: ''
    };

    const systemBase = "You are a principal engineer. Rewrite the user's code according to the style instructions. Output only the executable code without markdown wrapping, comments or explanations.";
    
    const prompts = {
      clean: `Refactor this ${selectedLang} code to make it exceptionally clean, descriptive, readable, and well-commented:\n\n${code}`,
      optimized: `Refactor this ${selectedLang} code to optimize performance, complexity, memory usage, and execution loops:\n\n${code}`,
      secure: `Refactor this ${selectedLang} code to be secure, adding inputs sanitization, exception handling, and resolving api-key/injection flaws:\n\n${code}`,
      bestPractice: `Refactor this ${selectedLang} code using the best standard programming practices, ES modules, or standard libraries:\n\n${code}`
    };

    let totalTokens = 0;
    let totalLatency = 0;
    let totalCost = 0;
    let finalProvider = '';

    // Run each refactor variation through dispatcher
    const variations = ['clean', 'optimized', 'secure', 'bestPractice'] as const;
    for (const v of variations) {
      const prompt = prompts[v];
      const aiRes = await executeAICompletion(selectedProvider, [{ role: 'user', content: prompt }], systemBase);
      
      responseData[v] = aiRes.text.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
      totalTokens += aiRes.metrics.tokens;
      totalLatency += aiRes.metrics.latency;
      totalCost += aiRes.metrics.cost;
      finalProvider = aiRes.metrics.provider;
    }

    res.json({
      ...responseData,
      metrics: {
        tokens: totalTokens,
        latency: totalLatency,
        cost: totalCost,
        provider: finalProvider
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function getCleanMock(code: string, language: string): string {
  // Simple regex adjustments to simulate refactoring
  return code
    .replace(/function\s+(\w+)\((.*)\)/g, '/**\n * Mapped code utility\n */\nfunction $1($2)')
    .replace(/const\s+(\w+)\s*=/g, 'const descriptive$1 =');
}

function getOptimizedMock(code: string, language: string): string {
  return `// Optimized execution flow\nconst cache = new Map();\n\n` + code;
}

function getSecureMock(code: string, language: string): string {
  // Strip hardcoded API keys
  let secured = code.replace(/(['"`])[A-Za-z0-9+/]{12,}\1/g, 'process.env.API_CONFIG_KEY');
  // Wrap in try-catch
  return `try {\n  ${secured.split('\n').join('\n  ')}\n} catch (error) {\n  console.error("Secure Execution Failure:", error);\n}`;
}

function getBestPracticeMock(code: string, language: string): string {
  return `// Idiomatic structural rewrite\n` + code;
}

export default router;
