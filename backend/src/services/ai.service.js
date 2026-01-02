import { getGeminiModel as getModel, getGeminiVisionModel, generateContent, generateContentFromImage } from '../config/gemini.js';

// Re-export for use in controllers
export { getGeminiModel } from '../config/gemini.js';

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
