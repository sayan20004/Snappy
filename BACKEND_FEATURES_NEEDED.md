# Backend Features Needed for Frontend Components

## Analysis Date: November 15, 2025

After analyzing the frontend components, here are the features that need backend API support:

---

## ✅ **Already Implemented (Working)**

1. **Authentication** (`/api/auth`)
   - ✅ Register, Login, Get Me
   
2. **Todos** (`/api/todos`)
   - ✅ CRUD operations
   - ✅ Advanced fields (subSteps, links, energyLevel, effortMinutes, mood, etc.)
   - ✅ Comments array in model
   - ✅ Reactions array in model
   
3. **Lists** (`/api/lists`)
   - ✅ CRUD operations
   - ✅ Invite collaborator
   
4. **Users** (`/api/users`)
   - ✅ Search users
   - ✅ Get user by ID

---

## 🔴 **Missing Backend Features**

### 1. **Comments API** (High Priority)
**Frontend Component:** `TaskComments.jsx`

**Current Status:** Comments are stored locally in component state and sent to backend in `todo.comments` array, but there's no dedicated API for:
- Adding comments with real-time updates
- Editing comments
- Deleting comments
- Adding reactions to comments
- Fetching comment authors with populated user data

**Needed Endpoints:**
```javascript
POST   /api/todos/:id/comments          // Add comment
PATCH  /api/todos/:id/comments/:commentId  // Edit comment
DELETE /api/todos/:id/comments/:commentId  // Delete comment
POST   /api/todos/:id/comments/:commentId/reactions  // Add reaction
```

**Backend Model Update Needed:**
```javascript
// Todo.model.js - Comments schema needs enhancement
comments: [{
  _id: mongoose.Schema.Types.ObjectId,  // ADD THIS
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // ADD THIS
  reactions: [{  // ADD THIS
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: String  // 'like', 'love', 'check', 'zap'
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }  // ADD THIS
}]
```

---

### 2. **Activity/Timeline API** (Medium Priority)
**Frontend Component:** `ActivityTimeline.jsx`

**Current Status:** Activity model exists but no routes/controller

**Needed Endpoints:**
```javascript
GET /api/activities              // Get user's activity feed
GET /api/activities/list/:listId // Get activities for specific list
```

**Files to Create:**
- `backend/src/routes/activity.routes.js`
- `backend/src/controllers/activity.controller.js`

---

### 3. **Templates API** (Medium Priority)
**Frontend Component:** `TaskTemplates.jsx`

**Current Status:** Templates are hardcoded in frontend. Users can't save custom templates.

**Needed:**
- Template model
- CRUD endpoints for user templates

**New Model Needed:**
```javascript
// backend/src/models/Template.model.js
{
  name: String,
  description: String,
  template: {
    title: String,
    subSteps: Array,
    tags: Array,
    effortMinutes: Number,
    energyLevel: String,
    mood: String
  },
  owner: ObjectId,
  isPublic: Boolean,
  usageCount: Number
}
```

**Needed Endpoints:**
```javascript
GET    /api/templates        // Get user's templates + public ones
POST   /api/templates        // Create template
PATCH  /api/templates/:id    // Update template
DELETE /api/templates/:id    // Delete template
POST   /api/templates/:id/use // Increment usage count
```

---

### 4. **Bulk Operations** (Medium Priority)
**Frontend Component:** `ExportImport.jsx`

**Current Status:** Export works client-side, but import needs backend validation

**Needed Endpoints:**
```javascript
POST /api/import/json        // Bulk import todos and lists
POST /api/export/json        // Server-side export with filtering
GET  /api/export/csv         // CSV export
```

---

### 5. **Smart Inbox Integration** (Low Priority - Future Feature)
**Frontend Component:** `SmartInbox.jsx`

**Current Status:** Uses mock data

**Needed for Full Implementation:**
- Email integration webhook endpoint
- WhatsApp API integration
- Screenshot upload and OCR processing
- Voice note transcription

**Needed Endpoints:**
```javascript
GET    /api/inbox/items              // Get inbox items
POST   /api/inbox/items              // Add inbox item
POST   /api/inbox/items/:id/convert  // Convert to task
DELETE /api/inbox/items/:id          // Dismiss item
POST   /api/inbox/email/webhook      // Email webhook
POST   /api/inbox/upload/screenshot  // Upload screenshot
POST   /api/inbox/voice/transcribe   // Voice transcription
```

---

### 6. **AI/Intention Engine** (Low Priority - Mock/Client-side OK)
**Frontend Component:** `IntentionEngine.jsx`

**Current Status:** Uses client-side algorithm

**Future Enhancement (Optional):**
```javascript
POST /api/ai/plan-day        // AI-powered day planning
POST /api/ai/suggest-time    // Suggest best time for task
POST /api/ai/prioritize      // AI task prioritization
```

---

### 7. **Focus Mode Tracking** (Low Priority)
**Frontend Component:** `FocusMode.jsx`

**Current Status:** Todo model has `focusSessions` array but no dedicated endpoints

**Needed Endpoints:**
```javascript
POST   /api/todos/:id/focus/start    // Start focus session
POST   /api/todos/:id/focus/stop     // End focus session
GET    /api/focus/stats               // Get focus statistics
```

---

### 8. **File Uploads** (Medium Priority)
**Needed For:** Voice notes, screenshots, attachments

**Current Status:** Todo model has `voiceNote` field but no upload endpoint

**Needed Endpoints:**
```javascript
POST /api/upload/voice       // Upload voice note
POST /api/upload/image       // Upload screenshot/image
POST /api/upload/file        // Upload general attachment
```

**Required Package:**
```bash
npm install multer cloudinary  # or AWS S3
```

---

## 📊 **Priority Summary**

### 🔥 **Immediate (High Priority)**
1. **Comments API** - TaskComments component needs real backend support
2. **Activity API** - Timeline page needs data

### ⚡ **Soon (Medium Priority)**
3. **Templates API** - Users want to save custom templates
4. **File Upload** - For voice notes and attachments
5. **Bulk Import/Export** - Enterprise feature

### 💡 **Future (Low Priority)**
6. **Smart Inbox Integration** - Advanced feature
7. **AI Endpoints** - Enhancement (client-side works for now)
8. **Focus Tracking API** - Nice to have

---

## 🚀 **Recommended Implementation Order**

1. **Week 1:** Comments API + Activity API
2. **Week 2:** Templates API + File Upload
3. **Week 3:** Bulk Operations + Focus Tracking
4. **Week 4:** Smart Inbox (if needed)

---

## 📝 **Notes**

- Most critical missing piece is **Comments API** - frontend is fully built but sends data in wrong format
- Socket.io is already set up, use it for real-time comment notifications
- Activity logging exists in todo/list controllers but no way to fetch activity feed
- Consider rate limiting for file uploads
- Add proper error handling for all new endpoints
- Update API documentation after implementation

