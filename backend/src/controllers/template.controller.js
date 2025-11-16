import Template from '../models/Template.model.js';
import { AppError } from '../middleware/error.middleware.js';

// @desc    Get templates (user's + public)
// @route   GET /api/templates
// @access  Private
export const getTemplates = async (req, res, next) => {
  try {
    const { category, isPublic } = req.query;

    const query = {
      $or: [
        { owner: req.userId },
        { isPublic: true }
      ]
    };

    if (category) query.category = category;
    if (isPublic !== undefined) {
      delete query.$or;
      query.owner = req.userId;
      query.isPublic = isPublic === 'true';
    }

    const templates = await Template.find(query)
      .populate('owner', 'name email')
      .sort({ usageCount: -1, createdAt: -1 })
      .lean();

    res.json({ templates });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single template
// @route   GET /api/templates/:id
// @access  Private
export const getTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await Template.findById(id)
      .populate('owner', 'name email');

    if (!template) {
      throw new AppError('Template not found', 404);
    }

    // Check access (owner or public)
    if (template.owner._id.toString() !== req.userId && !template.isPublic) {
      throw new AppError('Access denied', 403);
    }

    res.json({ template });
  } catch (error) {
    next(error);
  }
};

// @desc    Create template
// @route   POST /api/templates
// @access  Private
export const createTemplate = async (req, res, next) => {
  try {
    const {
      name,
      description,
      icon,
      template,
      isPublic,
      category
    } = req.body;

    const newTemplate = await Template.create({
      name,
      description: description || '',
      icon: icon || '📝',
      template,
      owner: req.userId,
      isPublic: isPublic || false,
      category: category || 'other',
      usageCount: 0
    });

    res.status(201).json({ template: newTemplate });
  } catch (error) {
    next(error);
  }
};

// @desc    Update template
// @route   PATCH /api/templates/:id
// @access  Private
export const updateTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await Template.findOne({ _id: id, owner: req.userId });

    if (!template) {
      throw new AppError('Template not found or not authorized', 404);
    }

    const allowedUpdates = [
      'name',
      'description',
      'icon',
      'template',
      'isPublic',
      'category'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        template[field] = req.body[field];
      }
    });

    await template.save();

    res.json({ template });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete template
// @route   DELETE /api/templates/:id
// @access  Private
export const deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await Template.findOneAndDelete({
      _id: id,
      owner: req.userId
    });

    if (!template) {
      throw new AppError('Template not found or not authorized', 404);
    }

    res.json({ message: 'Template deleted', id });
  } catch (error) {
    next(error);
  }
};

// @desc    Use template (increment usage count)
// @route   POST /api/templates/:id/use
// @access  Private
export const useTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await Template.findById(id);

    if (!template) {
      throw new AppError('Template not found', 404);
    }

    // Check access
    if (template.owner.toString() !== req.userId && !template.isPublic) {
      throw new AppError('Access denied', 403);
    }

    template.usageCount += 1;
    await template.save();

    res.json({ 
      message: 'Template usage recorded',
      usageCount: template.usageCount 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular templates
// @route   GET /api/templates/popular
// @access  Private
export const getPopularTemplates = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const templates = await Template.find({ isPublic: true })
      .populate('owner', 'name email')
      .sort({ usageCount: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({ templates });
  } catch (error) {
    next(error);
  }
};
