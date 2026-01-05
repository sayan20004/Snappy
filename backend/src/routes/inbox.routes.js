import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import User from '../models/User.model.js';
import crypto from 'crypto';
import { fetchGmailMessages, fetchOutlookMessages } from '../services/email.service.js';

const router = express.Router();

// Simple encryption for storing credentials (use proper encryption in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-secret-key-here!!';
const ALGORITHM = 'aes-256-cbc';

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

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

    // Test the connection first
    try {
      console.log('Testing email connection for:', email);
      let testEmails;
      
      if (provider === 'gmail') {
        testEmails = await fetchGmailMessages(email, appPassword, 1);
      } else if (provider === 'outlook') {
        testEmails = await fetchOutlookMessages(email, appPassword, 1);
      } else {
        return res.status(400).json({ error: 'Unsupported provider' });
      }
      
      console.log('Connection test successful, found', testEmails.length, 'messages');
    } catch (testError) {
      console.error('Email connection test failed:', testError);
      return res.status(401).json({ 
        error: 'Failed to connect to email. Please check your credentials and ensure IMAP is enabled.',
        details: testError.message
      });
    }

    // Store encrypted credentials in user document
    const encryptedPassword = encrypt(appPassword);
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        emailConnection: {
          provider,
          email,
          connectedAt: new Date(),
          encryptedPassword, // Store encrypted
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
    res.status(500).json({ error: 'Failed to connect email', details: error.message });
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
    // Get user's email connection
    const user = await User.findById(req.userId).select('emailConnection');
    
    if (!user?.emailConnection?.encryptedPassword) {
      return res.status(400).json({ error: 'Email not connected' });
    }

    const { provider, email, encryptedPassword } = user.emailConnection;
    
    // Decrypt the password
    const appPassword = decrypt(encryptedPassword);
    
    // Fetch real emails
    let emails;
    const limit = parseInt(req.query.limit) || 10;
    
    console.log('Fetching emails for:', email, 'provider:', provider);
    
    if (provider === 'gmail') {
      emails = await fetchGmailMessages(email, appPassword, limit);
    } else if (provider === 'outlook') {
      emails = await fetchOutlookMessages(email, appPassword, limit);
    } else {
      return res.status(400).json({ error: 'Unsupported email provider' });
    }

    console.log('Fetched', emails.length, 'emails');

    res.json({
      emails: emails,
      total: emails.length,
      unread: emails.filter(e => e.unread).length,
    });
  } catch (error) {
    console.error('Email fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch emails',
      details: error.message 
    });
  }
});

export default router;
