import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { executeAICompletion } from '../services/providers/aiDispatcher.js';

const router = Router();

router.post('/generate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { code, language, testType, provider } = req.body; // testType: unit, integration, edge, api

  if (!code || !language) {
    return res.status(400).json({ error: 'code and language are required' });
  }

  const selectedTestType = testType || 'unit';
  const selectedProvider = provider || 'gemini-2.5-pro';
  const systemPrompt = "You are a professional software test engineer. Generate clean, well-structured test cases with descriptions. Output only the executable test code without explanations.";
  
  const userPrompt = `Generate a ${selectedTestType} test suite for the following ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;

  try {
    let testCode = '';
    let metrics = null;

    const aiRes = await executeAICompletion(selectedProvider, [{ role: 'user', content: userPrompt }], systemPrompt);
    testCode = aiRes.text.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
    metrics = aiRes.metrics;

    res.json({ testCode, metrics });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function getMockTestCode(code: string, language: string, testType: string): string {
  const langLower = language.toLowerCase();
  
  if (langLower.includes('python')) {
    return `import unittest
# Mock ${testType} test generated automatically

class TestWorkspaceCode(unittest.TestCase):
    def setUp(self):
        # Initialize test subjects
        pass

    def test_success_path(self):
        """Verify the standard success flow"""
        # Given: Sample context parsed from function
        # When: executing code logic
        # Then: assert output is not None
        self.assertTrue(True)

    def test_edge_case_empty_input(self):
        """Verify code stability on empty boundary parameters"""
        # Given: None or Empty structure
        # Then: raises ValueError or handles gracefully
        with self.assertRaises(ValueError):
            # simulate empty trigger
            raise ValueError("Input cannot be empty")

if __name__ == '__main__':
    unittest.main()`;
  }

  if (langLower.includes('java')) {
    return `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Mock ${testType} test generated automatically
 */
public class CodebaseWorkspaceTest {

    @Test
    public void testStandardExecution() {
        // Given: setup fields
        // When: triggering function
        // Then: evaluate conditions
        assertTrue(true, "Execution should succeed");
    }

    @Test
    public void testBoundaryLimits() {
        // Assert handler limits
        assertThrows(IllegalArgumentException.class, () -> {
            throw new IllegalArgumentException("Param out of bounds");
        });
    }
}`;
  }

  // TypeScript / JavaScript
  const isTs = langLower.includes('typescript') || langLower.includes('ts');
  return `import { describe, it, expect, beforeEach } from 'vitest';
// Mock ${testType} test suite generated automatically

describe('Codebase Workspace Suite', () => {
  beforeEach(() => {
    // Setup test runners
  });

  it('should process the standard code flow successfully', () => {
    // Given: input mock parameters
    // When: invoking target logic
    // Then: assert values match expected outputs
    const sampleOutput = true;
    expect(sampleOutput).toBe(true);
  });

  it('should handle boundary edge cases and avoid crash failures', () => {
    // Given: null or undefined values
    // When: calling logic, then verify fallback works
    const execution = () => {
      // Simulate input checks
      return { success: false, reason: 'Invalid parameters' };
    };
    expect(execution().success).toBe(false);
  });
});`;
}

export default router;
