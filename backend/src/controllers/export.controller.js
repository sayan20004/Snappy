import Todo from '../models/Todo.model.js';
import List from '../models/List.model.js';
import { AppError } from '../middleware/error.middleware.js';

// @desc    Export data to JSON
// @route   GET /api/export/json
// @access  Private
export const exportToJSON = async (req, res, next) => {
  try {
    const { includeArchived = false } = req.query;

    const todoQuery = { owner: req.userId };
    if (!includeArchived) {
      todoQuery.status = { $ne: 'archived' };
    }

    const [todos, lists] = await Promise.all([
      Todo.find(todoQuery).lean(),
      List.find({
        $or: [
          { owner: req.userId },
          { 'collaborators.user': req.userId }
        ]
      }).lean()
    ]);

    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: req.userId,
      data: {
        todos,
        lists
      },
      stats: {
        totalTodos: todos.length,
        totalLists: lists.length
      }
    };

    res.json(exportData);
  } catch (error) {
    next(error);
  }
};

// @desc    Export data to CSV
// @route   GET /api/export/csv
// @access  Private
export const exportToCSV = async (req, res, next) => {
  try {
    const { includeArchived = false } = req.query;

    const todoQuery = { owner: req.userId };
    if (!includeArchived) {
      todoQuery.status = { $ne: 'archived' };
    }

    const todos = await Todo.find(todoQuery)
      .populate('listId', 'name')
      .lean();

    // CSV headers
    const headers = [
      'Title',
      'Status',
      'Priority',
      'List',
      'Tags',
      'Due Date',
      'Energy Level',
      'Effort (mins)',
      'Created At',
      'Completed At'
    ];

    // Convert todos to CSV rows
    const rows = todos.map(todo => [
      todo.title.replace(/"/g, '""'), // Escape quotes
      todo.status,
      todo.priority,
      todo.listId?.name || '',
      (todo.tags || []).join('; '),
      todo.dueAt ? new Date(todo.dueAt).toISOString() : '',
      todo.energyLevel || '',
      todo.effortMinutes || '',
      new Date(todo.createdAt).toISOString(),
      todo.completedAt ? new Date(todo.completedAt).toISOString() : ''
    ]);

    // Build CSV string
    const csv = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="snappy-todo-export-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Import data from JSON
// @route   POST /api/import/json
// @access  Private
export const importFromJSON = async (req, res, next) => {
  try {
    const { data, options = {} } = req.body;

    if (!data || !data.todos) {
      throw new AppError('Invalid import data format', 400);
    }

    const {
      replaceExisting = false,
      skipDuplicates = true
    } = options;

    const results = {
      todos: { imported: 0, skipped: 0, errors: [] },
      lists: { imported: 0, skipped: 0, errors: [] }
    };

    // Import lists first (if provided)
    if (data.lists && data.lists.length > 0) {
      for (const listData of data.lists) {
        try {
          // Check for duplicates
          const existing = await List.findOne({
            owner: req.userId,
            name: listData.name
          });

          if (existing && skipDuplicates) {
            results.lists.skipped++;
            continue;
          }

          if (existing && replaceExisting) {
            await List.findByIdAndUpdate(existing._id, {
              ...listData,
              owner: req.userId,
              _id: existing._id
            });
            results.lists.imported++;
          } else if (!existing) {
            await List.create({
              ...listData,
              owner: req.userId,
              collaborators: [] // Reset collaborators for security
            });
            results.lists.imported++;
          }
        } catch (error) {
          results.lists.errors.push({
            list: listData.name,
            error: error.message
          });
        }
      }
    }

    // Import todos
    for (const todoData of data.todos) {
      try {
        // Check for duplicates by title
        if (skipDuplicates) {
          const existing = await Todo.findOne({
            owner: req.userId,
            title: todoData.title,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within last 24h
          });

          if (existing) {
            results.todos.skipped++;
            continue;
          }
        }

        // Validate and clean data
        const cleanTodo = {
          title: todoData.title,
          note: todoData.note || '',
          owner: req.userId,
          tags: todoData.tags || [],
          priority: todoData.priority || 2,
          status: todoData.status || 'todo',
          dueAt: todoData.dueAt || null,
          energyLevel: todoData.energyLevel,
          effortMinutes: todoData.effortMinutes,
          location: todoData.location,
          mood: todoData.mood,
          subSteps: todoData.subSteps || [],
          source: 'import'
        };

        await Todo.create(cleanTodo);
        results.todos.imported++;
      } catch (error) {
        results.todos.errors.push({
          todo: todoData.title,
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: 'Import completed',
      results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import from CSV
// @route   POST /api/import/csv
// @access  Private
export const importFromCSV = async (req, res, next) => {
  try {
    const { csvData, options = {} } = req.body;

    if (!csvData) {
      throw new AppError('No CSV data provided', 400);
    }

    const { skipDuplicates = true } = options;

    // Parse CSV (simple implementation)
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    const results = {
      imported: 0,
      skipped: 0,
      errors: []
    };

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
        const todoData = {};

        headers.forEach((header, index) => {
          todoData[header.toLowerCase().replace(/ /g, '_')] = values[index];
        });

        // Check for duplicates
        if (skipDuplicates) {
          const existing = await Todo.findOne({
            owner: req.userId,
            title: todoData.title
          });

          if (existing) {
            results.skipped++;
            continue;
          }
        }

        // Create todo
        await Todo.create({
          title: todoData.title,
          note: todoData.note || '',
          owner: req.userId,
          status: todoData.status || 'todo',
          priority: parseInt(todoData.priority) || 2,
          tags: todoData.tags ? todoData.tags.split(';').map(t => t.trim()) : [],
          dueAt: todoData.due_date || null,
          source: 'import'
        });

        results.imported++;
      } catch (error) {
        results.errors.push({
          line: i + 1,
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: 'CSV import completed',
      results
    });
  } catch (error) {
    next(error);
  }
};
