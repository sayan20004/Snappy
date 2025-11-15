import User from '../models/User.model.js';

// @desc    Get all users (for mentions/collaboration)
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    
    let query = {};
    
    // Search by name or email
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('name email avatarUrl')
      .limit(20)
      .lean();

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email avatarUrl createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};
