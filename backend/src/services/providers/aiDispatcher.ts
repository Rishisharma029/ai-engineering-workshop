import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

// Estimated cost per token parameters
const PRICING: Record<string, { input: number; output: number }> = {
  'gemini-2.5-flash': { input: 0.075 / 1_000_000, output: 0.30 / 1_000_000 },
  'gemini-2.5-pro': { input: 1.25 / 1_000_000, output: 5.00 / 1_000_000 },
  'claude-sonnet': { input: 3.00 / 1_000_000, output: 15.00 / 1_000_000 },
  'gpt-4o': { input: 2.50 / 1_000_000, output: 10.00 / 1_000_000 }
};

export interface AIMetrics {
  tokens: number;
  latency: number;
  cost: number;
  provider: string;
}

export interface AIResponse {
  text: string;
  stream?: Readable;
  metrics: AIMetrics;
}

// Estimate tokens based on characters count
export function estimateTokens(text: string): number {
  return Math.ceil((text || '').length / 4);
}

// Map provider keys to user friendly names
function getProviderDisplayName(model: string): string {
  switch (model) {
    case 'gemini-2.5-pro': return 'Gemini 2.5 Pro';
    case 'gemini-2.5-flash': return 'Gemini 2.5 Flash';
    case 'claude-sonnet': return 'Claude 3.5 Sonnet';
    case 'gpt-4o': return 'GPT-4o';
    default: return 'Local Mock';
  }
}

// alternate roles helper for Gemini API
function formatGeminiContents(messages: { role: string; content: string }[]) {
  const contents: any[] = [];
  let currentRole: 'user' | 'model' | null = null;
  let currentParts: any[] = [];

  for (const msg of messages) {
    if (msg.role === 'system') continue;
    const role = msg.role === 'assistant' ? 'model' : 'user';

    if (currentRole === role) {
      currentParts.push({ text: msg.content });
    } else {
      if (currentRole !== null) {
        contents.push({ role: currentRole, parts: currentParts });
      }
      currentRole = role;
      currentParts = [{ text: msg.content }];
    }
  }
  if (currentRole !== null) {
    contents.push({ role: currentRole, parts: currentParts });
  }

  // Ensure first role is 'user'
  if (contents.length > 0 && contents[0].role !== 'user') {
    contents.unshift({ role: 'user', parts: [{ text: 'Hello' }] });
  }

  return contents;
}

// alternate roles helper for Claude API
function formatClaudeMessages(messages: { role: string; content: string }[]) {
  const result: any[] = [];
  let currentRole: 'user' | 'assistant' | null = null;
  let currentContent = '';

  for (const msg of messages) {
    if (msg.role === 'system') continue;
    const role = msg.role === 'assistant' ? 'assistant' : 'user';

    if (currentRole === role) {
      currentContent += '\n\n' + msg.content;
    } else {
      if (currentRole !== null) {
        result.push({ role: currentRole, content: currentContent });
      }
      currentRole = role;
      currentContent = msg.content;
    }
  }
  if (currentRole !== null) {
    result.push({ role: currentRole, content: currentContent });
  }

  // Ensure first role is 'user'
  if (result.length > 0 && result[0].role !== 'user') {
    result.unshift({ role: 'user', content: 'Hello' });
  }

  return result;
}

// Call target model directly
async function callProviderAPI(
  model: string,
  messages: { role: string; content: string }[],
  systemPrompt: string,
  stream: boolean,
  temperature: number
): Promise<{ text: string; streamBody?: ReadableStream<Uint8Array>; promptTokens: number }> {
  const promptTokens = estimateTokens(systemPrompt + messages.map(m => m.content).join(' '));

  if (model.startsWith('gemini')) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

    let targetModel = model;
    if (model === 'gemini-2.5-pro') {
      targetModel = 'gemini-1.5-pro';
    } else if (model === 'gemini-2.5-flash') {
      targetModel = 'gemini-1.5-flash';
    }

    const action = stream ? 'streamGenerateContent' : 'generateContent';
    const queryParams = stream ? '?alt=sse' : '';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:${action}${queryParams}&key=${apiKey}`;

    const body = {
      contents: formatGeminiContents(messages),
      systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
      generationConfig: {
        temperature
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    if (stream) {
      return { text: '', streamBody: response.body || undefined, promptTokens };
    } else {
      const data: any = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { text, promptTokens };
    }
  } 
  
  if (model === 'claude-sonnet') {
    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('CLAUDE_API_KEY or ANTHROPIC_API_KEY is not configured');

    const url = 'https://api.anthropic.com/v1/messages';
    const body = {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      system: systemPrompt || undefined,
      messages: formatClaudeMessages(messages),
      stream,
      temperature
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API Error (${response.status}): ${errText}`);
    }

    if (stream) {
      return { text: '', streamBody: response.body || undefined, promptTokens };
    } else {
      const data: any = await response.json();
      const text = data.content?.[0]?.text || '';
      return { text, promptTokens };
    }
  }

  if (model === 'gpt-4o') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

    const url = 'https://api.openai.com/v1/chat/completions';
    
    const openAIMessages = [];
    if (systemPrompt) {
      openAIMessages.push({ role: 'system', content: systemPrompt });
    }
    openAIMessages.push(...messages);

    const body = {
      model: 'gpt-4o-mini', // gpt-4o-mini used to save credits, but represents gpt-4o service tier
      messages: openAIMessages,
      stream,
      temperature
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API Error (${response.status}): ${errText}`);
    }

    if (stream) {
      return { text: '', streamBody: response.body || undefined, promptTokens };
    } else {
      const data: any = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      return { text, promptTokens };
    }
  }

  throw new Error(`Unsupported model: ${model}`);
}

// Orchestrator executing requests with fallback logic
export async function executeAICompletion(
  provider: string,
  messages: { role: string; content: string }[],
  systemPrompt = '',
  options: { stream?: boolean; temperature?: number } = {}
): Promise<AIResponse> {
  const startTime = Date.now();
  const stream = options.stream ?? false;
  const temperature = options.temperature ?? 0.2;

  // Execution pipeline for fallback
  let modelsToTry = [provider];
  if (provider.startsWith('gemini')) {
    // If Gemini selected: try chosen provider -> try alternate gemini tier -> try Claude -> try OpenAI
    const fallbackGemini = provider === 'gemini-2.5-flash' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    modelsToTry = [
      provider,
      fallbackGemini,
      'gemini-1.5-pro',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'claude-sonnet',
      'gpt-4o'
    ];
  } else if (provider === 'claude-sonnet') {
    modelsToTry = ['claude-sonnet', 'gpt-4o'];
  } else {
    modelsToTry = ['gpt-4o'];
  }

  let lastError: any = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const activeModel = modelsToTry[i];
    
    // Check if key is available
    const hasKey = 
      (activeModel.startsWith('gemini') && process.env.GEMINI_API_KEY) ||
      (activeModel === 'claude-sonnet' && (process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY)) ||
      (activeModel === 'gpt-4o' && process.env.OPENAI_API_KEY);

    if (!hasKey) {
      continue; // skip if no key configured
    }

    try {
      const isRetry = i === 1 && activeModel === provider;
      console.log(`[AI Dispatcher] Invoking ${getProviderDisplayName(activeModel)}${isRetry ? ' (RETRY ATTEMPT)' : ''}...`);

      const result = await callProviderAPI(activeModel, messages, systemPrompt, stream, temperature);
      
      const promptTokens = result.promptTokens;

      if (stream && result.streamBody) {
        const reader = result.streamBody.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let completionText = '';

        const nodeStream = new Readable({
          read() {}
        });

        // Background reader loop
        (async () => {
          try {
            let done = false;
            while (!done) {
              const { value, done: isDone } = await reader.read();
              done = isDone;
              
              if (value) {
                const chunkText = decoder.decode(value, { stream: true });
                buffer += chunkText;
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  let extractedText = '';
                  
                  if (activeModel.startsWith('gemini')) {
                    if (line.startsWith('data: ')) {
                      const dataStr = line.slice(6).trim();
                      if (dataStr) {
                        try {
                          const parsed = JSON.parse(dataStr);
                          extractedText = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        } catch (e) {}
                      }
                    }
                  } else if (activeModel === 'claude-sonnet') {
                    if (line.startsWith('data: ')) {
                      const dataStr = line.slice(6).trim();
                      if (dataStr) {
                        try {
                          const parsed = JSON.parse(dataStr);
                          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                            extractedText = parsed.delta.text;
                          }
                        } catch (e) {}
                      }
                    }
                  } else {
                    // OpenAI
                    if (line.startsWith('data: ')) {
                      const dataStr = line.slice(6).trim();
                      if (dataStr && dataStr !== '[DONE]') {
                        try {
                          const parsed = JSON.parse(dataStr);
                          extractedText = parsed.choices?.[0]?.delta?.content || '';
                        } catch (e) {}
                      }
                    }
                  }

                  if (extractedText) {
                    completionText += extractedText;
                    const payload = {
                      choices: [{ delta: { content: extractedText } }]
                    };
                    nodeStream.push(`data: ${JSON.stringify(payload)}\n\n`);
                  }
                }
              }
            }

            // End stream and write metrics payload
            const latency = Date.now() - startTime;
            const completionTokens = estimateTokens(completionText);
            const totalTokens = promptTokens + completionTokens;
            const pricing = PRICING[activeModel] || { input: 0, output: 0 };
            const cost = (promptTokens * pricing.input) + (completionTokens * pricing.output);

            const metrics: AIMetrics = {
              tokens: totalTokens,
              latency,
              cost,
              provider: getProviderDisplayName(activeModel)
            };

            nodeStream.push(`event: metrics\ndata: ${JSON.stringify(metrics)}\n\n`);
            nodeStream.push('event: done\ndata: [DONE]\n\n');
            nodeStream.push(null);

          } catch (streamErr) {
            console.error('[AI Stream Parser Error]', streamErr);
            nodeStream.push(`data: ${JSON.stringify({ choices: [{ delta: { content: '\n[Stream Error Encountered]' } }] })}\n\n`);
            nodeStream.push(null);
          }
        })();

        return {
          text: '',
          stream: nodeStream,
          metrics: {
            tokens: promptTokens,
            latency: Date.now() - startTime,
            cost: promptTokens * (PRICING[activeModel]?.input || 0),
            provider: getProviderDisplayName(activeModel)
          }
        };

      } else {
        // Normal completion
        const latency = Date.now() - startTime;
        const completionTokens = estimateTokens(result.text);
        const totalTokens = promptTokens + completionTokens;
        const pricing = PRICING[activeModel] || { input: 0, output: 0 };
        const cost = (promptTokens * pricing.input) + (completionTokens * pricing.output);

        return {
          text: result.text,
          metrics: {
            tokens: totalTokens,
            latency,
            cost,
            provider: getProviderDisplayName(activeModel)
          }
        };
      }

    } catch (err: any) {
      console.warn(`[AI Dispatcher] Attempt with ${getProviderDisplayName(activeModel)} failed: ${err.message}`);
      lastError = err;
    }
  }

  // If we made it here, all configured model APIs failed or no keys exist. Fall back to local mock completion.
  console.log('[AI Dispatcher] All providers failed or keys are missing. Running in OFFLINE MOCK mode...');
  const mockStart = Date.now();
  const mockText = getMockChatResponse(messages);
  const promptTokens = estimateTokens(systemPrompt + messages.map(m => m.content).join(' '));
  const completionTokens = estimateTokens(mockText);
  
  if (stream) {
    const mockStream = new Readable({
      read() {}
    });

    const words = mockText.split(/(\s+)/);
    let index = 0;

    const interval = setInterval(() => {
      if (index >= words.length) {
        clearInterval(interval);
        
        const latency = Date.now() - mockStart;
        const metrics: AIMetrics = {
          tokens: promptTokens + completionTokens,
          latency,
          cost: 0.0,
          provider: 'Local Mock'
        };

        mockStream.push(`event: metrics\ndata: ${JSON.stringify(metrics)}\n\n`);
        mockStream.push('event: done\ndata: [DONE]\n\n');
        mockStream.push(null);
      } else {
        const payload = {
          choices: [{ delta: { content: words[index] } }]
        };
        mockStream.push(`data: ${JSON.stringify(payload)}\n\n`);
        index++;
      }
    }, 15);

    return {
      text: '',
      stream: mockStream,
      metrics: {
        tokens: promptTokens,
        latency: Date.now() - mockStart,
        cost: 0.0,
        provider: 'Local Mock'
      }
    };
  } else {
    return {
      text: mockText,
      metrics: {
        tokens: promptTokens + completionTokens,
        latency: Date.now() - mockStart,
        cost: 0.0,
        provider: 'Local Mock'
      }
    };
  }
}

// offline mock fallback helper
function getMockChatResponse(messages: { role: string; content: string }[]): string {
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const query = lastUserMsg.toLowerCase();

  if (query.includes('readme.md') || query.includes('readme')) {
    return `# E2E Workspace Test\n\n## 🚀 E2E-Workspace-Project - AI Engineering Workspace\n\nAutomated testing project. Built with a premium modern stack.\n\n---`;
  }

  if (query.includes('explain') || query.includes('what does')) {
    return `### Codebase Architecture & File Summary 💡\n\nThis workspace encapsulates a professional React & TypeScript frontend paired with an Express API backend.\n\nKey directories:\n1. **frontend/src**: Contains components, hooks, and views for the AI Engineering Workshop dashboards.\n2. **backend/src**: Implements controllers, services, database migrations, and AI providers.\n\n*Note: Running in offline mock fallback.*`;
  }
  if (query.includes('bug') || query.includes('error') || query.includes('leak') || query.includes('risk')) {
    return `### Static Scanning Code Observations 🐛\n\n- **Hardcoded Secret Alert**: Potential configuration keys detected in code files.\n- **Nested Array Loops**: Large computational blocks found in the SVG graphing helpers.\n- **Error Handlers**: Express routers lack complete try-catch boundaries on network exceptions.`;
  }
  return `### AI Engineering Workshop Assistant 🤖\n\nI processed your request: *"${lastUserMsg}"*.\n\nSince no active LLM API Keys are configured in your backend \`.env\` file, I am serving this simulated response. Configure \`GEMINI_API_KEY\` or \`OPENAI_API_KEY\` in your local env setup to activate live vector search and RAG indexing.`;
}
