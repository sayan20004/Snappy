/**
 * Backend Design Patterns
 * Service Layer, Repository Pattern, Factory
 */

// ============================================
// REPOSITORY PATTERN (Data Access Layer)
// ============================================
export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(filter = {}, options = {}) {
    try {
      const { limit = 100, skip = 0, sort = { createdAt: -1 } } = options;
      
      return await this.model
        .find(filter)
        .limit(limit)
        .skip(skip)
        .sort(sort)
        .lean();
    } catch (error) {
      throw this._handleError(error, 'findAll');
    }
  }

  async findById(id) {
    try {
      return await this.model.findById(id).lean();
    } catch (error) {
      throw this._handleError(error, 'findById');
    }
  }

  async findOne(filter) {
    try {
      return await this.model.findOne(filter).lean();
    } catch (error) {
      throw this._handleError(error, 'findOne');
    }
  }

  async create(data) {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {
      throw this._handleError(error, 'create');
    }
  }

  async update(id, data) {
    try {
      return await this.model
        .findByIdAndUpdate(id, data, { new: true, runValidators: true })
        .lean();
    } catch (error) {
      throw this._handleError(error, 'update');
    }
  }

  async delete(id) {
    try {
      return await this.model.findByIdAndDelete(id).lean();
    } catch (error) {
      throw this._handleError(error, 'delete');
    }
  }

  async count(filter = {}) {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      throw this._handleError(error, 'count');
    }
  }

  async exists(filter) {
    try {
      return await this.model.exists(filter);
    } catch (error) {
      throw this._handleError(error, 'exists');
    }
  }

  _handleError(error, operation) {
    const enhancedError = new Error(
      `Repository ${operation} failed: ${error.message}`
    );
    enhancedError.originalError = error;
    enhancedError.operation = operation;
    return enhancedError;
  }
}

// ============================================
// SERVICE LAYER PATTERN
// Business logic separated from controllers
// ============================================
export class BaseService {
  constructor(repository) {
    this.repository = repository;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getAll(userId, options = {}) {
    try {
      const cacheKey = `all_${userId}_${JSON.stringify(options)}`;
      
      // Check cache
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Fetch from repository
      const data = await this.repository.findAll({ user: userId }, options);
      
      // Update cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      throw this._handleError(error, 'getAll');
    }
  }

  async getById(id, userId) {
    try {
      const item = await this.repository.findOne({ _id: id, user: userId });
      
      if (!item) {
        throw new Error('Item not found');
      }

      return item;
    } catch (error) {
      throw this._handleError(error, 'getById');
    }
  }

  async create(data, userId) {
    try {
      const item = await this.repository.create({
        ...data,
        user: userId
      });

      this.invalidateCache(userId);
      return item;
    } catch (error) {
      throw this._handleError(error, 'create');
    }
  }

  async update(id, data, userId) {
    try {
      // Verify ownership
      await this.getById(id, userId);

      const updated = await this.repository.update(id, data);
      this.invalidateCache(userId);
      
      return updated;
    } catch (error) {
      throw this._handleError(error, 'update');
    }
  }

  async delete(id, userId) {
    try {
      // Verify ownership
      await this.getById(id, userId);

      const deleted = await this.repository.delete(id);
      this.invalidateCache(userId);
      
      return deleted;
    } catch (error) {
      throw this._handleError(error, 'delete');
    }
  }

  invalidateCache(userId) {
    // Clear all cache entries for this user
    for (const key of this.cache.keys()) {
      if (key.includes(userId)) {
        this.cache.delete(key);
      }
    }
  }

  clearCache() {
    this.cache.clear();
  }

  _handleError(error, operation) {
    const enhancedError = new Error(
      `Service ${operation} failed: ${error.message}`
    );
    enhancedError.originalError = error;
    enhancedError.operation = operation;
    return enhancedError;
  }
}

// ============================================
// FACTORY PATTERN FOR RESPONSES
// ============================================
export class ResponseFactory {
  static success(data, message = 'Success', meta = {}) {
    return {
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString()
    };
  }

  static error(message, code = 'ERROR', details = null) {
    return {
      success: false,
      error: {
        message,
        code,
        details
      },
      timestamp: new Date().toISOString()
    };
  }

  static paginated(items, page, limit, total) {
    return this.success(items, 'Success', {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  }

  static created(data, message = 'Created successfully') {
    return {
      ...this.success(data, message),
      statusCode: 201
    };
  }

  static noContent(message = 'Deleted successfully') {
    return {
      success: true,
      message,
      statusCode: 204,
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================
// MIDDLEWARE FACTORY
// ============================================
export class MiddlewareFactory {
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  static validate(schema) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        return res.status(400).json(
          ResponseFactory.error(
            'Validation failed',
            'VALIDATION_ERROR',
            error.details.map(d => ({
              field: d.path.join('.'),
              message: d.message
            }))
          )
        );
      }

      req.validatedBody = value;
      next();
    };
  }

  static rateLimit(options = {}) {
    const {
      maxRequests = 100,
      windowMs = 15 * 60 * 1000, // 15 minutes
      message = 'Too many requests'
    } = options;

    const requests = new Map();

    return (req, res, next) => {
      const key = req.ip || req.connection.remoteAddress;
      const now = Date.now();

      if (!requests.has(key)) {
        requests.set(key, []);
      }

      const userRequests = requests.get(key);
      
      // Remove old requests
      const validRequests = userRequests.filter(
        time => now - time < windowMs
      );

      if (validRequests.length >= maxRequests) {
        return res.status(429).json(
          ResponseFactory.error(message, 'RATE_LIMIT_EXCEEDED')
        );
      }

      validRequests.push(now);
      requests.set(key, validRequests);

      next();
    };
  }

  static cache(duration = 300) {
    const cache = new Map();

    return (req, res, next) => {
      const key = req.originalUrl || req.url;

      if (cache.has(key)) {
        const cached = cache.get(key);
        if (Date.now() - cached.timestamp < duration * 1000) {
          return res.json(cached.data);
        }
      }

      const originalJson = res.json.bind(res);
      res.json = (data) => {
        cache.set(key, {
          data,
          timestamp: Date.now()
        });
        originalJson(data);
      };

      next();
    };
  }
}

// ============================================
// MODULE PATTERN FOR LOGGER
// ============================================
export const Logger = (function() {
  const logs = [];
  const maxLogs = 1000;
  
  function formatMessage(level, message, meta) {
    return {
      level,
      message,
      meta,
      timestamp: new Date().toISOString()
    };
  }
  
  function log(level, message, meta = {}) {
    const entry = formatMessage(level, message, meta);
    
    logs.push(entry);
    if (logs.length > maxLogs) {
      logs.shift();
    }
    
    // Console output
    const consoleMethod = console[level] || console.log;
    consoleMethod(`[${entry.level.toUpperCase()}]`, message, meta);
  }
  
  return {
    debug(message, meta) {
      if (process.env.NODE_ENV !== 'production') {
        log('debug', message, meta);
      }
    },
    
    info(message, meta) {
      log('info', message, meta);
    },
    
    warn(message, meta) {
      log('warn', message, meta);
    },
    
    error(message, meta) {
      log('error', message, meta);
    },
    
    getLogs(level = null) {
      if (level) {
        return logs.filter(log => log.level === level);
      }
      return [...logs];
    },
    
    clearLogs() {
      logs.length = 0;
    }
  };
})();
