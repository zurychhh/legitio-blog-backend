# Phase 5 - Frontend Testing Guide

## Quick Start ⭐

### Prerequisites

1. **Backend Running:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

2. **Celery Worker (Optional but recommended):**
```bash
cd backend
./start_celery_worker.sh
```

3. **Frontend:**
```bash
cd frontend
npm run dev
```

4. **Open Browser:** http://localhost:5173

---

## Test 1: Login & Authentication

### Steps:

1. Navigate to http://localhost:5173
2. Should auto-redirect to /login
3. Enter credentials:
   - Email: `admin@test.com`
   - Password: `Admin123!`
4. Click "Log in"

### Expected Results:

✅ Redirects to Dashboard (/)
✅ Sidebar shows navigation menu
✅ Header shows user email
✅ No login page visible

### Test Logout:

1. Click user email in header
2. Click "Logout"
3. Should redirect to /login
4. Try to access http://localhost:5173/ directly
5. Should redirect back to /login

---

## Test 2: Dashboard

### Navigate:
Click "Dashboard" in sidebar or go to http://localhost:5173/

### Verify Statistics Cards:

✅ **Total Posts** - Shows count
✅ **Active Agents** - Shows count
✅ **Posts This Month** - Shows count
✅ **Celery Workers** - Shows "Online" (green) or "Offline" (red)

### Verify Usage Metrics:

✅ **Token Usage** - Progress bar with used/limit
✅ **Posts Quota** - Progress bar with used/limit

### Verify Recent Posts Table:

✅ Shows up to 5 most recent posts
✅ Columns: Title, Status, Words, SEO Score, Created
✅ Status tags are colored
✅ Click title → navigates to post detail

---

## Test 3: Agents Management

### Navigate:
Click "Agents" in sidebar or go to http://localhost:5173/agents

### Test Create Agent:

1. Click "Create Agent" button
2. Fill form:
   - Name: `Test Agent`
   - Description: `Test description`
   - Tone & Style: Select `professional`
   - Keywords: `test, automation, react`
   - Target Audience: `Developers`
   - SEO Focus: Select `balanced`
   - Schedule (Cron): Leave empty or `0 9 * * MON`
   - Active: Toggle ON
3. Click OK

### Expected Results:

✅ Success message appears
✅ Table refreshes with new agent
✅ Agent appears in list with all fields

### Test Edit Agent:

1. Find the test agent
2. Click "Edit" button
3. Change name to `Test Agent Updated`
4. Click OK

### Expected Results:

✅ Success message
✅ Name updates in table

### Test Delete Agent:

1. Click "Delete" button on test agent
2. Confirm deletion
3. Agent removed from list

---

## Test 4: Posts Management

### Navigate:
Click "Posts" in sidebar or go to http://localhost:5173/posts

### Test Search:

1. Type text in search box
2. Press Enter or click search icon
3. Table filters to matching posts

### Test Status Filter:

1. Select filter dropdown
2. Choose "Draft", "Published", etc.
3. Table filters by status

### Test View Post:

1. Click "View" button or click post title
2. Should navigate to post detail page
3. Verify tabs: Preview, Edit, SEO Metrics, Details

**Preview Tab:**
✅ Shows formatted article
✅ Markdown rendered correctly
✅ Title, meta description visible

**Edit Tab:**
✅ Form with title, meta_title, meta_description, content
✅ Can edit fields
✅ Character counters for meta fields
✅ Click "Save Changes" → success message

**SEO Metrics Tab:**
✅ Cards show: SEO Score, Readability, Word Count, Tokens
✅ Descriptions table with meta info
✅ Cost displayed

**Details Tab:**
✅ All post metadata
✅ IDs, timestamps, status
✅ Published URL (if published)

### Test Schedule Post:

1. Go back to Posts list
2. Find a draft post
3. Click "Schedule" button
4. Pick future date/time
5. Optionally select publisher
6. Click OK

### Expected Results:

✅ Success message
✅ Post status changes to "scheduled"
✅ scheduled_at timestamp set

### Test Publish Post:

1. Find a draft post
2. Click "Publish" button
3. Success message: "Post publishing task started"
4. If worker is online, post will publish
5. If worker is offline, task queued

---

## Test 5: Sources Management

### Navigate:
Click "Sources" in sidebar or go to http://localhost:5173/sources

### Test Create RSS Source:

1. Click "Add Source"
2. Fill form:
   - Agent: Select an agent
   - Name: `TechCrunch RSS`
   - Source Type: `RSS Feed`
   - RSS Feed URL: `https://techcrunch.com/feed/`
   - Fetch Limit: `10`
   - Active: Toggle ON
3. Click OK

### Expected Results:

✅ Success message
✅ Source appears in list
✅ Shows RSS type tag
✅ URL visible in configuration column

### Test Connection:

1. Click "Test" button on source
2. Wait for result

### Expected Results:

✅ Success: "Source connection successful!"
✅ Or error message if URL invalid

### Test Edit/Delete:

Similar to agents - Edit and Delete buttons work

---

## Test 6: Publishers Management

### Navigate:
Click "Publishers" in sidebar or go to http://localhost:5173/publishers

### Test Create WordPress Publisher:

1. Click "Add Publisher"
2. Fill form:
   - Agent: Select an agent
   - Name: `My WordPress Blog`
   - Publisher Type: `WordPress`
   - WordPress URL: `https://yourblog.com`
   - Username: `admin`
   - Application Password: `xxxx xxxx xxxx xxxx`
   - Default Status: `draft`
   - Active: Toggle ON
3. Click OK

### Expected Results:

✅ Success message
✅ Publisher appears in list
✅ Shows WordPress type tag

### Test Connection:

1. Click "Test" button
2. Wait for result

**Note:** Will fail if credentials incorrect or site unreachable.

---

## Test 7: Task Monitoring

### Navigate:
Click "Tasks" in sidebar or go to http://localhost:5173/tasks

### Verify Dashboard:

✅ **Worker Status** - Online (green) or Offline (red)
✅ **Active Tasks** - Count of running tasks
✅ **Celery Status** - healthy or unhealthy
✅ **Last Check** - Current time (updates every 5s)

### If Worker Offline:

✅ Yellow warning banner shows
✅ Banner text: "Celery workers are currently offline..."
✅ Instructions to start worker
✅ "Trigger Generation" button disabled

### If Worker Online:

✅ No warning banner
✅ All buttons enabled
✅ Health check details card shows worker name, database status

### Test Trigger Post Generation:

1. Click "Trigger Generation" button
2. Fill form:
   - Agent: Select active agent
   - Topic (optional): `Test Topic`
   - Keyword (optional): `test keyword`
3. Click OK

### Expected Results:

✅ Success message with task ID
✅ If worker online, task appears in Active Tasks table
✅ Task processes and completes (watch active tasks)
✅ After completion, new post appears in Posts page

### Test Retry Failed:

1. Click "Retry Failed Publications"
2. Message shows count of retried tasks

---

## Test 8: Responsive Design

### Desktop (> 992px):

✅ Sidebar expanded by default
✅ All columns visible in tables
✅ Cards in rows (4 columns)

### Tablet (768px - 992px):

1. Resize browser window
2. ✅ Sidebar still visible
3. ✅ Cards adjust to 2-3 columns
4. ✅ Tables scroll horizontally if needed

### Mobile (< 768px):

1. Resize to phone width
2. ✅ Sidebar collapses by default
3. ✅ Cards stack vertically (1 column)
4. ✅ Tables are scrollable
5. ✅ Buttons remain touch-friendly

### Test Sidebar Collapse:

1. Click hamburger menu icon in header
2. ✅ Sidebar collapses to icons only
3. ✅ Content area expands
4. ✅ Click again to expand sidebar

---

## Test 9: Error Handling

### Test Invalid Login:

1. Logout
2. Try to login with wrong password
3. ✅ Error message shows
4. ✅ Stays on login page

### Test API Errors:

1. Stop backend server
2. Try to create an agent
3. ✅ Error message appears
4. ✅ User-friendly message (not raw error)

### Test 401 Unauthorized:

1. Clear localStorage (browser dev tools)
2. Try to access /agents
3. ✅ Auto-redirects to /login

---

## Test 10: Full Workflow

### Complete Content Generation Flow:

**Setup:**
1. Create Agent:
   - Name: "Tech Blog Agent"
   - Keywords: "AI, automation, technology"
   - SEO Focus: balanced
   - Active: Yes

2. Create RSS Source (optional):
   - Agent: Tech Blog Agent
   - URL: https://techcrunch.com/feed/
   - Active: Yes

3. Create WordPress Publisher (optional):
   - Agent: Tech Blog Agent
   - WordPress credentials
   - Active: Yes

**Generate Content:**

4. Go to Tasks page
5. Click "Trigger Generation"
6. Select "Tech Blog Agent"
7. Topic: "AI Trends 2025"
8. Keyword: "artificial intelligence"
9. Click OK

**Monitor:**

10. Watch Active Tasks count
11. If worker online, task processes
12. Success message or error appears

**Review:**

13. Go to Posts page
14. Find newly generated post
15. Click to view details
16. Check:
    - ✅ Title generated
    - ✅ Content is markdown
    - ✅ SEO score calculated
    - ✅ Word count shows
    - ✅ Meta fields populated

**Edit (Optional):**

17. Click Edit tab
18. Modify content
19. Click "Save Changes"
20. ✅ Changes persist

**Schedule:**

21. Back to Posts list
22. Click "Schedule" on the post
23. Pick date/time (future)
24. Select publisher (if configured)
25. Click OK
26. ✅ Status changes to "scheduled"

**Publish:**

27. Or click "Publish" for immediate publishing
28. Task triggers (if worker online)
29. Post status updates to "published"
30. Published URL appears (if publisher configured)

---

## Troubleshooting

### Issue: "Cannot read properties of null"

**Cause:** Backend not running or API URL wrong

**Fix:**
```bash
# Check backend is running
curl http://localhost:8000/api/v1/auth/login

# Check .env file
cat frontend/.env
# Should show: VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Issue: Login fails with CORS error

**Cause:** Backend CORS not configured

**Fix:**
Already configured in backend. Restart backend:
```bash
cd backend
uvicorn app.main:app --reload
```

### Issue: "Workers Offline" on Tasks page

**Cause:** Celery worker not running

**Fix:**
```bash
cd backend
./start_celery_worker.sh
```

### Issue: Tasks never complete (stuck PENDING)

**Cause:** Worker not running or Redis not connected

**Fix:**
1. Check Redis: `redis-cli ping` → should return `PONG`
2. Check worker: `ps aux | grep celery`
3. Restart worker: `./start_celery_worker.sh`

### Issue: Blank screen or crash

**Cause:** Missing dependencies or build error

**Fix:**
```bash
cd frontend
npm install
npm run dev
```

**Check console (F12)** for JavaScript errors.

### Issue: Slow loading or timeouts

**Cause:** Backend database slow or network issues

**Fix:**
1. Check backend logs: `tail -f /tmp/uvicorn.log`
2. Check database connection
3. Restart backend

---

## Performance Checks

### Page Load Times:

✅ Login: < 500ms
✅ Dashboard: < 1s (depends on data)
✅ Posts list: < 1s
✅ Post detail: < 800ms
✅ Tasks page: < 500ms (auto-refreshes)

### Network Requests:

✅ API calls show in Network tab (F12)
✅ Responses are JSON
✅ Status codes: 200 (success), 401 (unauthorized), 4xx/5xx (errors)

### Browser Compatibility:

✅ Chrome (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Edge (latest)

**Note:** IE11 not supported (uses modern React/ES6+)

---

## Summary Checklist

### Authentication:
- ✅ Login works
- ✅ Logout works
- ✅ Protected routes work
- ✅ Auto-redirect on 401

### Pages:
- ✅ Dashboard loads with stats
- ✅ Agents CRUD works
- ✅ Posts list and detail work
- ✅ Sources CRUD works
- ✅ Publishers CRUD works
- ✅ Tasks monitoring works

### Features:
- ✅ Search and filters work
- ✅ Forms validate input
- ✅ Modals open/close
- ✅ Tables paginate
- ✅ Status tags show colors
- ✅ Confirmations prevent accidents

### UX:
- ✅ Loading states show
- ✅ Success messages appear
- ✅ Error messages are helpful
- ✅ Navigation is intuitive
- ✅ Responsive on all devices

---

**Documentation**: PHASE5_COMPLETE.md
**Frontend**: http://localhost:5173
**Backend**: http://localhost:8000
**API Docs**: http://localhost:8000/docs
