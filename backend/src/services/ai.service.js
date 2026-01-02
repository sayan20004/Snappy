import { getGeminiModel as getModel, getGeminiVisionModel, generateContent, generateContentFromImage } from '../config/gemini.js';

// Re-export for use in controllers
export { getGeminiModel } from '../config/gemini.js';

// AUTO-CLASSIFY TASK (Elon's Loop Optimization)
// Automatically infer energy, duration, and tags from task title
export const autoClassifyTask = async (taskTitle) => {
  const model = getModel();
  
  const prompt = `You are a task classification AI. Analyze this task and return ONLY valid JSON.

TASK: "${taskTitle}"

Return this exact structure:
{
  "energy": "low" | "medium" | "high",
  "duration": <number in minutes>,
  "tags": ["tag1", "tag2"],
  "confidence": <0.0 to 1.0>
}

RULES:
- Energy: "high" for creative/strategic work, "medium" for standard tasks, "low" for simple admin
- Duration: realistic estimate (5-120 minutes)
- Tags: 2-4 relevant tags (lowercase, no #)
- Confidence: how sure you are (0.7+ for clear tasks)

Examples:
"Write Q3 report" → {"energy": "high", "duration": 90, "tags": ["work", "report", "writing"], "confidence": 0.9}
"Buy milk" → {"energy": "low", "duration": 15, "tags": ["shopping", "personal"], "confidence": 0.95}
"Debug login API" → {"energy": "high", "duration": 60, "tags": ["coding", "bug", "api"], "confidence": 0.85}

OUTPUT (JSON only):`;

  try {
    const response = await generateContent(model, prompt);
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    // Validate and normalize
    return {
      energy: ['low', 'medium', 'high'].includes(parsed.energy) ? parsed.energy : 'medium',
      duration: Math.min(Math.max(parsed.duration || 30, 5), 480),
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
      confidence: Math.min(Math.max(parsed.confidence || 0.7, 0), 1)
    };
  } catch (error) {
    console.error('autoClassifyTask error:', error);
    // Fallback: basic heuristics
    const words = taskTitle.toLowerCase();
    return {
      energy: words.includes('write') || words.includes('design') || words.includes('plan') ? 'high' : 'medium',
      duration: 30,
      tags: ['general'],
      confidence: 0.3
    };
  }
};

// TASK B: Agentic AI - JSON-only mode for single task parsing
export const extractTasksFromTextJSON = async (text) => {
  const model = getModel();
  
  // Strict system prompt for JSON-only output
  const prompt = `You are a strict JSON API. Parse the user input and return ONLY valid JSON. No explanations, no markdown, no code blocks.

OUTPUT SCHEMA:
{
  "title": "string",
  "priority": "high" | "medium" | "low",
  "dueDate": "ISO 8601 string or null",
  "tags": ["string"],
  "suggestedSubtasks": ["string"]
}

RULES:
- Extract priority from keywords like "urgent", "asap", "important" → "high"; "someday", "maybe" → "low"; else "medium"
- Extract dates from phrases like "next Friday", "tomorrow", "Jan 5" and convert to ISO format
- Extract tags from # symbols (e.g., "#work" → "work")
- Suggest 2-4 logical subtasks if the task is complex
- Return null for dueDate if no date mentioned

USER INPUT:
"${text}"

OUTPUT (JSON only):`;

  try {
    const response = await generateContent(model, prompt);
    // Strip any markdown code blocks
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    // Validate schema
    if (!parsed.title || !parsed.priority || !Array.isArray(parsed.tags) || !Array.isArray(parsed.suggestedSubtasks)) {
      throw new Error('Invalid AI response schema');
    }
    
    return parsed;
  } catch (error) {
    console.error('AI JSON extraction error:', error);
    // Fallback: basic parsing
    return {
      title: text.substring(0, 100),
      priority: 'medium',
      dueDate: null,
      tags: [],
      suggestedSubtasks: []
    };
  }
};

// Extract tasks from natural language (legacy multi-task array)
export const extractTasksFromText = async (text) => {
  const model = getModel();
  const prompt = `Extract all tasks, dates, priorities, and subtasks from the following text. 
Return ONLY a valid JSON array of tasks with this structure:
[{
  "title": "task title",
  "note": "detailed description",
  "dueAt": "ISO date or null",
  "priority": 0-3 (0=urgent, 1=high, 2=normal, 3=low),
  "tags": ["tag1", "tag2"],
  "subSteps": [{"text": "substep", "completed": false}],
  "estimatedMinutes": number or null
}]

Text to analyze:
${text}

Return ONLY the JSON array, no explanations.`;

  try {
    const response = await generateContent(model, prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('AI extraction error:', error);
    return [];
  }
};

// Extract tasks from image (screenshot, photo, PDF page)
export const extractTasksFromImage = async (imageBuffer, mimeType = 'image/jpeg') => {
  const model = getGeminiVisionModel();
  const prompt = `Analyze this image and extract all tasks, assignments, deadlines, or action items.
Return ONLY a valid JSON array of tasks with this structure:
[{
  "title": "task title",
  "note": "detailed description",
  "dueAt": "ISO date or null",
  "priority": 0-3 (0=urgent, 1=high, 2=normal, 3=low),
  "tags": ["tag1", "tag2"],
  "subSteps": [{"text": "substep", "completed": false}]
}]

Look for:
- Assignment titles and descriptions
- Due dates and deadlines
- Requirements and subtasks
- Priority indicators
- Any handwritten or typed text

Return ONLY the JSON array, no explanations.`;

  try {
    const imageParts = [{
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType
      }
    }];
    
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('AI image extraction error:', error);
    return [];
  }
};

// Generate contextual suggestions based on user's tasks and patterns
export const generateSmartSuggestions = async (userContext) => {
  const model = getModel();
  const { todos, currentTime, userEnergy, upcomingEvents, workload } = userContext;
  
  const prompt = `You are a productivity AI assistant. Analyze the user's context and provide 3-5 smart, actionable suggestions.

Current Context:
- Time: ${currentTime}
- User energy level: ${userEnergy}
- Upcoming tasks: ${JSON.stringify(todos.slice(0, 10))}
- Workload: ${workload}
- Upcoming events: ${JSON.stringify(upcomingEvents)}

Generate suggestions like:
- Focus session recommendations
- Task prioritization advice
- Break suggestions
- Task breakdown recommendations
- Schedule optimization

Return ONLY a JSON array:
[{
  "type": "focus|break|prioritize|breakdown|schedule",
  "suggestion": "suggestion text",
  "action": "actionable command",
  "reasoning": "why this helps"
}]

Return ONLY the JSON array.`;

  try {
    const response = await generateContent(model, prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('AI suggestions error:', error);
    return [];
  }
};

// Break down complex task into subtasks
export const breakdownTask = async (taskTitle, taskNote) => {
  const model = getModel();
  const prompt = `Break down this task into specific, actionable subtasks:

Task: ${taskTitle}
Details: ${taskNote || 'No additional details'}

Return ONLY a JSON array of subtasks:
[{
  "text": "subtask description",
  "estimatedMinutes": number
}]

Make subtasks:
- Specific and actionable
- In logical order
- Realistic time estimates
- Not too granular

Return ONLY the JSON array.`;

  try {
    const response = await generateContent(model, prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('AI breakdown error:', error);
    return [];
  }
};

// Generate study plan from content
export const generateStudyPlan = async (content, deadline, currentKnowledge = '') => {
  const model = getModel();
  const prompt = `Create a study plan for this content with deadline: ${deadline}

Content:
${content}

Current knowledge: ${currentKnowledge || 'Starting from scratch'}

Return ONLY a JSON object:
{
  "plan": [{
    "day": "Day 1",
    "date": "ISO date",
    "tasks": ["task 1", "task 2"],
    "duration": "estimated hours",
    "focus": "what to learn"
  }],
  "totalHours": number,
  "difficulty": "easy|medium|hard",
  "tips": ["tip 1", "tip 2"]
}

Return ONLY the JSON object.`;

  try {
    const response = await generateContent(model, prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('AI study plan error:', error);
    return null;
  }
};

// AI command execution (agent-like behavior)
export const executeAICommand = async (command, userContext) => {
  const model = getModel();
  const prompt = `You are an AI assistant that executes productivity commands.

User command: "${command}"

User context: ${JSON.stringify(userContext)}

Analyze the command and return ONLY a JSON object:
{
  "action": "create_task|update_tasks|delete_tasks|create_plan|search|analyze",
  "parameters": {
    // relevant parameters for the action
  },
  "explanation": "what you will do",
  "tasks": [] // if creating/modifying tasks
}

Common commands:
- "Show all tasks due this week and create a plan"
- "Move all low-priority tasks to Saturday"
- "Create tasks from my notes"
- "Break down my hardest task"

Return ONLY the JSON object.`;

  try {
    const response = await generateContent(model, prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('AI command error:', error);
    return null;
  }
};

// Draft content for a task (email, essay, etc.)
export const draftContent = async (taskTitle, taskNote, contentType = 'general') => {
  const model = getModel();
  const prompt = `Draft ${contentType} content for this task:

Task: ${taskTitle}
Details: ${taskNote || 'No additional details'}

Provide a professional, well-structured draft.
Return ONLY the drafted content, no JSON.`;

  try {
    const response = await generateContent(model, prompt);
    return response;
  } catch (error) {
    console.error('AI draft error:', error);
    return null;
  }
};

// Analyze priority based on multiple factors
export const analyzePriority = async (task, userContext) => {
  const model = getModel();
  const prompt = `Analyze the priority of this task considering multiple factors:

Task: ${JSON.stringify(task)}
User context: ${JSON.stringify(userContext)}

Consider:
- Deadline urgency
- Emotional difficulty
- Skill growth impact
- Dependencies
- Time required
- User's energy patterns

Return ONLY a JSON object:
{
  "suggestedPriority": 0-3,
  "reasoning": "detailed explanation",
  "emotionalDifficulty": "low|medium|high",
  "optimalTime": "morning|afternoon|evening",
  "estimatedEnergy": "low|medium|high"
}

Return ONLY the JSON object.`;

  try {
    const response = await generateContent(model, prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('AI priority analysis error:', error);
    return null;
  }
};

// Summarize meeting/lecture transcript
export const summarizeTranscript = async (transcript) => {
  const model = getModel();
  const prompt = `Summarize this meeting/lecture transcript and extract actionable items:

Transcript:
${transcript}

Return ONLY a JSON object:
{
  "summary": "concise summary",
  "keyPoints": ["point 1", "point 2"],
  "tasks": [{
    "title": "task title",
    "note": "details",
    "dueAt": "ISO date or null",
    "priority": 0-3
  }],
  "decisions": ["decision 1"],
  "questions": ["follow-up question 1"]
}

Return ONLY the JSON object.`;

  try {
    const response = await generateContent(model, prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('AI transcript summary error:', error);
    return null;
  }
};

// INTENTION ENGINE (Steve Jobs' "Real World Solution")
// Generate intelligent daily schedule from user's todos
export const generateIntentionSchedule = async (userContext) => {
  const model = getModel();
  const { todos, currentTime, userEnergy, workHoursStart, workHoursEnd, breaks } = userContext;
  
  const prompt = `You are an elite scheduling AI. Create an optimal daily schedule.

CONTEXT:
- Current Time: ${currentTime}
- User Energy: ${userEnergy}
- Work Hours: ${workHoursStart} to ${workHoursEnd}
- Tasks (${todos.length}):
${todos.map((t, i) => `${i + 1}. "${t.title}" [${t.energyLevel} energy, ${t.effortMinutes}min, priority: ${t.priority}]`).join('\n')}

RULES:
1. Schedule high-energy tasks during peak hours (${userEnergy === 'high' ? 'morning' : 'afternoon'})
2. Group similar tasks (batch processing)
3. Include 5-10min breaks between focus blocks
4. Don't overschedule - leave 20% buffer
5. Prioritize by: deadline > energy match > priority

OUTPUT (JSON only):
{
  "schedule": [
    {
      "taskId": "task_id or null for break",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "title": "task title or 'Break'",
      "reasoning": "why scheduled here",
      "energyMatch": 0.0-1.0
    }
  ],
  "summary": "One sentence overview",
  "warnings": ["warning if overbooked"]
}`;

  try {
    const response = await generateContent(model, prompt);
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    return {
      schedule: parsed.schedule || [],
      summary: parsed.summary || 'Your schedule is ready',
      warnings: parsed.warnings || [],
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Intention Engine error:', error);
    // Fallback: simple time-based scheduling
    return {
      schedule: todos.slice(0, 5).map((t, i) => ({
        taskId: t._id,
        startTime: `${9 + i}:00`,
        endTime: `${9 + i + 1}:00`,
        title: t.title,
        reasoning: 'Simple chronological order',
        energyMatch: 0.5
      })),
      summary: 'Basic schedule created',
      warnings: ['Using fallback scheduler - AI unavailable'],
      generatedAt: new Date().toISOString()
    };
  }
};

