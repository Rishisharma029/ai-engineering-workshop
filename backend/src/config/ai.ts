import { Readable } from 'stream';
import dotenv from 'dotenv';

// Ensure env variables are loaded before evaluation
dotenv.config();

const openAIKey = process.env.OPENAI_API_KEY;
const apiKey = openAIKey;
const geminiKey = process.env.GEMINI_API_KEY;
const isMock = !openAIKey && !geminiKey;

console.log(isMock ? 'AI Service: Running in MOCK mode (No API Key)' : `AI Service: Running in REAL mode (OpenAI: ${!!openAIKey}, Gemini: ${!!geminiKey})`);


export function isMockMode(): boolean {
  return isMock;
}

// Generate text embeddings
export async function generateEmbedding(text: string): Promise<number[]> {
  const openAIKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openAIKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIKey}`
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-3-small'
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Failed to fetch OpenAI embedding, falling back:', error);
    }
  }

  if (geminiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: {
            parts: [{ text }]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini Embedding API error: ${response.statusText}`);
      }

      const data: any = await response.json();
      const values = data.embedding?.values;
      if (values && Array.isArray(values)) {
        if (values.length === 768) {
          // Pad to 1536 to keep dimension sizes consistent
          return [...values, ...new Array(768).fill(0)];
        }
        return values;
      }
      throw new Error('Invalid response format from Gemini Embedding API');
    } catch (error) {
      console.error('Failed to fetch Gemini embedding, falling back:', error);
    }
  }

  // Fallback mock mode
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const vector: number[] = [];
  for (let j = 0; j < 1536; j++) {
    // Create a value between -1 and 1
    const seed = Math.sin(hash + j) * 10000;
    vector.push(seed - Math.floor(seed) * 2 - 1);
  }
  return vector;
}

// Single-run completion
export async function chatCompletion(system: string, prompt: string): Promise<string> {
  if (isMock) {
    // Return a structured mock response depending on prompt keyword
    const lower = prompt.toLowerCase();
    if (lower.includes('readme') || lower.includes('documentation')) {
      return `# Generated Documentation\n\nThis is a mock-generated documentation file. Provide an \`OPENAI_API_KEY\` to generate production-quality results.`;
    }
    if (lower.includes('test') || lower.includes('unit test')) {
      return `// Mock Unit Tests\ndescribe('Mock Test Suit', () => {\n  it('should run successfully', () => {\n    expect(true).toBe(true);\n  });\n});`;
    }
    return `This is a simulated AI response. Please configure \`OPENAI_API_KEY\` in your backend \`.env\` for live results.`;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      })
    });

    const data = await response.json();
    return data.choices[0].message.content || '';
  } catch (error) {
    console.error('OpenAI completion failed:', error);
    return 'Error generating response from OpenAI API.';
  }
}

// Stream responses (SSE)
export async function chatCompletionStream(
  messages: { role: string; content: string }[],
  projectContext?: string
): Promise<Readable> {
  if (isMock) {
    let interval: NodeJS.Timeout;

    // Create an artificial stream that prints text chunk by chunk
    const readable = new Readable({
      read() {},
      destroy(err, callback) {
        clearInterval(interval);
        callback(err);
      }
    });

    const mockResponse = getMockChatResponse(messages, projectContext);
    
    // Split mock response into small words or characters to stream
    const words = mockResponse.split(/(\s+)/);
    let index = 0;

    interval = setInterval(() => {
      if (index >= words.length) {
        readable.push(null); // End stream
        clearInterval(interval);
      } else {
        const payload = {
          choices: [
            {
              delta: {
                content: words[index]
              }
            }
          ]
        };
        readable.push(`data: ${JSON.stringify(payload)}\n\n`);
        index++;
      }
    }, 15); // Emulates typing effect

    if (interval.unref) {
      interval.unref();
    }

    return readable;
  }

  try {
    const systemPrompt = `You are a professional AI software engineering assistant. Use the following codebase context to answer the user's questions: \n\n${projectContext || 'No context available.'}`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    // Convert fetch body stream (which is a standard Web stream) into a Node Readable stream
    const webStream = response.body;
    if (!webStream) {
      throw new Error('Response body is null');
    }

    const reader = webStream.getReader();
    const nodeStream = new Readable({
      async read() {
        try {
          const { done, value } = await reader.read();
          if (done) {
            this.push(null);
          } else {
            this.push(Buffer.from(value));
          }
        } catch (err: any) {
          this.destroy(err);
        }
      }
    });

    return nodeStream;
  } catch (error: any) {
    console.error('OpenAI stream connection failed:', error);
    const readable = new Readable({
      read() {}
    });
    readable.push(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Error connecting to OpenAI Stream API: ' + error.message } }] })}\n\n`);
    readable.push(null);
    return readable;
  }
}

// Generate realistic answers for mock chat
function getMockChatResponse(messages: { role: string; content: string }[], context?: string): string {
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const query = lastUserMsg.toLowerCase();

  let contextSummary = '';
  if (context) {
    contextSummary = '\n\n*(Visualized using local indexing context)*';
  }

  if (query.includes('explain') || query.includes('what does')) {
    return `### Project Structure & Purpose 💡

This codebase is a modern web application built using **React** and **TypeScript** on the frontend, with a **Node.js Express** backend server.

Based on my analysis of the files:
1. **Frontend Architecture**: Inside the \`frontend/src\` folder, we have components for the layout (Sidebar, Header) and routing page files representing dashboards, security scanners, documentation controllers, and refactoring comparisons.
2. **Backend Architecture**: The server starts in \`server.ts\` and imports modular routes (e.g. \`/api/projects\`, \`/api/analysis\`, \`/api/chat\`). Data persistence is handled via a dynamic DB driver that supports both PostgreSQL and SQLite fallback.

How would you like to proceed? We can deep dive into database queries or analyze static bug reports. ${contextSummary}`;
  }

  if (query.includes('bug') || query.includes('error') || query.includes('leak')) {
    return `### Codebase Bug Analysis 🐛

I ran a quick static scan on the context folders and detected several areas of interest:
* **Hardcoded Secrets**: Found potential API tokens or private keys in \`config.js\` or inside test mocks.
* **Large Functions**: The main drawing module contains an SVG rendering routine that exceeds 180 lines, impacting performance.
* **Missing Error Boundaries**: The API handler routes don't fully catch parsing exceptions when ZIP metadata is corrupt.

I suggest wrapping the JSON extraction inside a \`try-catch\` block or checking the validation schemas.${contextSummary}`;
  }

  if (query.includes('api') || query.includes('endpoint') || query.includes('route')) {
    return `### API Endpoints Catalog 🌐

Here is a catalog of the Express backend routes discovered:
* **POST** \`/api/auth/register\` & \`/api/auth/login\` - User authentication and JWT provisioning.
* **GET** \`/api/projects\` - Retrieve active workspaces.
* **POST** \`/api/projects/upload\` - Accepts ZIP file streams (via \`multer\`) for repository analysis.
* **GET** \`/api/analysis/:projectId\` - Tech stack breakdown and static metric scores.
* **POST** \`/api/chat/stream\` - Chat engine endpoint supporting server-sent event (SSE) streaming.
* **POST** \`/api/docs/generate\` - Auto-creates markdown guides.

Each API returns standard JSON shapes and conforms to proper REST practices.${contextSummary}`;
  }

  return `### AI Workspace Chat Assistant 🤖

I am processing your query regarding: *"${lastUserMsg}"*.

Since the \`OPENAI_API_KEY\` is not configured, I am serving a simulated developer response. If you provide a valid API key, I will scan your files and utilize **Retrieval-Augmented Generation (RAG)** to provide deep semantic answers mapping directly to your code symbols.

Would you like to try:
1. **Generating a test case** for a JavaScript function?
2. **Refactoring** a code block side-by-side?
3. **Reviewing security configurations**?${contextSummary}`;
}
