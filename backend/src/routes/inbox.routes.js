import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import User from '../models/User.model.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Email integration endpoints
router.get('/email/status', async (req, res) => {
  try {
    // Get user with email connection info
    const user = await User.findById(req.userId).select('emailConnection');
    
    res.json({
      connected: !!user?.emailConnection,
      email: user?.emailConnection?.email || null,
      provider: user?.emailConnection?.provider || null,
    });
  } catch (error) {
    console.error('Email status error:', error);
    res.status(500).json({ error: 'Failed to check email status' });
  }
});

router.post('/email/connect', async (req, res) => {
  try {
    const { provider, email, appPassword } = req.body;
    
    if (!email || !appPassword) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Store email connection in user document
    // NOTE: In production, encrypt the appPassword and use OAuth
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        emailConnection: {
          provider,
          email,
          connectedAt: new Date(),
          // Don't store the actual password for security
          // In production, use encrypted tokens or OAuth
        }
      },
      { new: true }
    ).select('emailConnection');

    res.json({
      success: true,
      message: 'Email connected successfully',
      email: user.emailConnection.email,
      provider: user.emailConnection.provider,
    });
  } catch (error) {
    console.error('Email connect error:', error);
    res.status(500).json({ error: 'Failed to connect email' });
  }
});

router.post('/email/disconnect', async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.userId,
      { $unset: { emailConnection: 1 } }
    );

    res.json({
      success: true,
      message: 'Email disconnected successfully',
    });
  } catch (error) {
    console.error('Email disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect email' });
  }
});

router.get('/email/fetch', async (req, res) => {
  try {
    // TODO: Implement actual email fetching
    // For now, return mock emails
    
    const mockEmails = [
      {
        id: 'email1',
        from: 'team@company.com',
        subject: 'Q1 Project Review Meeting',
        snippet: 'Hi, we need to schedule the Q1 project review. Please confirm your availability for next week...',
        body: 'Hi,\n\nWe need to schedule the Q1 project review meeting. Please confirm your availability for next week. Key topics to cover:\n\n1. Project milestones\n2. Budget review\n3. Next quarter planning\n\nBest regards,\nTeam',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        unread: true,
      },
      {
        id: 'email2',
        from: 'notifications@github.com',
        subject: '[GitHub] Pull Request Review Required',
        snippet: 'A new pull request needs your review: Feature/authentication-v2...',
        body: 'A new pull request needs your review:\n\nFeature/authentication-v2\n\nChanges:\n- Implemented JWT refresh tokens\n- Added password reset flow\n- Updated security tests\n\nPlease review at your earliest convenience.',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        unread: true,
      },
      {
        id: 'email3',
        from: 'client@business.com',
        subject: 'Urgent: Website Deployment Issue',
        snippet: 'Our production website is showing a 503 error. Can you please investigate ASAP?...',
        body: 'Hi,\n\nOur production website is showing a 503 error since this morning. Can you please investigate ASAP?\n\nURL: https://example.com\nError started: ~9:00 AM\nAffected pages: All pages\n\nThis is affecting our business operations. Please prioritize.',
        date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        unread: true,
      },
      {
        id: 'email4',
        from: 'HR@company.com',
        subject: 'Complete Your Annual Performance Review',
        snippet: 'Please complete your annual performance review by end of this week...',
        body: 'Hi,\n\nPlease complete your annual performance review by end of this week. The form is available in the HR portal.\n\nDeadline: Friday, 5 PM\n\nIf you have any questions, please reach out to HR.',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        unread: false,
      },
      {
        id: 'email5',
        from: 'design@agency.com',
        subject: 'New Design Mockups Ready for Review',
        snippet: 'The new homepage designs are ready. Please review and provide feedback...',
        body: 'Hi,\n\nThe new homepage designs are ready for your review. Please check the attached Figma link and provide feedback by Wednesday.\n\nLink: [Figma Design]\n\nKey changes:\n- Updated hero section\n- New testimonials layout\n- Mobile-first approach\n\nLooking forward to your thoughts!',
        date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        unread: false,
      },
    ];

    res.json({
      emails: mockEmails,
      total: mockEmails.length,
      unread: mockEmails.filter(e => e.unread).length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

export default router;
