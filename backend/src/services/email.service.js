import Imap from 'imap';
import { simpleParser } from 'mailparser';

export const fetchGmailMessages = async (email, appPassword, limit = 10) => {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: email,
      password: appPassword,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });

    const emails = [];

    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err, box) => {
        if (err) {
          imap.end();
          return reject(err);
        }

        // Fetch last N messages
        const totalMessages = box.messages.total;
        const fetchStart = Math.max(1, totalMessages - limit + 1);
        const fetchEnd = totalMessages;

        if (totalMessages === 0) {
          imap.end();
          return resolve([]);
        }

        const f = imap.seq.fetch(`${fetchStart}:${fetchEnd}`, {
          bodies: '',
          struct: true
        });

        f.on('message', (msg, seqno) => {
          msg.on('body', (stream, info) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) {
                console.error('Parse error:', err);
                return;
              }

              emails.push({
                id: `gmail-${seqno}`,
                from: parsed.from?.text || 'Unknown',
                subject: parsed.subject || '(No Subject)',
                snippet: parsed.text?.substring(0, 150) || '',
                body: parsed.text || parsed.html || '',
                date: parsed.date || new Date(),
                unread: true // IMAP flags can be checked for actual read status
              });
            });
          });
        });

        f.once('error', (err) => {
          console.error('Fetch error:', err);
          imap.end();
          reject(err);
        });

        f.once('end', () => {
          setTimeout(() => {
            imap.end();
            // Sort by date descending
            emails.sort((a, b) => new Date(b.date) - new Date(a.date));
            resolve(emails);
          }, 1000); // Give time for all messages to parse
        });
      });
    });

    imap.once('error', (err) => {
      console.error('IMAP connection error:', err);
      reject(err);
    });

    imap.once('end', () => {
      console.log('IMAP connection ended');
    });

    imap.connect();
  });
};

export const fetchOutlookMessages = async (email, appPassword, limit = 10) => {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: email,
      password: appPassword,
      host: 'outlook.office365.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });

    const emails = [];

    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err, box) => {
        if (err) {
          imap.end();
          return reject(err);
        }

        const totalMessages = box.messages.total;
        const fetchStart = Math.max(1, totalMessages - limit + 1);
        const fetchEnd = totalMessages;

        if (totalMessages === 0) {
          imap.end();
          return resolve([]);
        }

        const f = imap.seq.fetch(`${fetchStart}:${fetchEnd}`, {
          bodies: '',
          struct: true
        });

        f.on('message', (msg, seqno) => {
          msg.on('body', (stream, info) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) {
                console.error('Parse error:', err);
                return;
              }

              emails.push({
                id: `outlook-${seqno}`,
                from: parsed.from?.text || 'Unknown',
                subject: parsed.subject || '(No Subject)',
                snippet: parsed.text?.substring(0, 150) || '',
                body: parsed.text || parsed.html || '',
                date: parsed.date || new Date(),
                unread: true
              });
            });
          });
        });

        f.once('error', (err) => {
          console.error('Fetch error:', err);
          imap.end();
          reject(err);
        });

        f.once('end', () => {
          setTimeout(() => {
            imap.end();
            emails.sort((a, b) => new Date(b.date) - new Date(a.date));
            resolve(emails);
          }, 1000);
        });
      });
    });

    imap.once('error', (err) => {
      console.error('IMAP connection error:', err);
      reject(err);
    });

    imap.once('end', () => {
      console.log('IMAP connection ended');
    });

    imap.connect();
  });
};
