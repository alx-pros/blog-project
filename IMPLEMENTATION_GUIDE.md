# The Web Room - Setup & Implementation Guide

## 🎉 Implementation Complete

All requested features have been successfully implemented! Here's what was added:

---

## ✨ Features Implemented

### 1. **Rate Limiting** ✅
- **Post Rate Limiting**: 3 posts per 24 hours per user
- **Comment Rate Limiting**: 20 comments per hour per user
- Server-side enforcement via Convex mutations
- User-friendly error messages when limits are exceeded
- Soft rate limiting that gracefully handles exceeded limits

**Location**: `convex/rateLimiting.ts`, `convex/posts.ts`, `convex/comment.ts`

---

### 2. **Rich Text Editor (WordPress-style)** ✅
Integrated **TipTap** editor with:
- **Text Formatting**: Bold, Italic, Underline
- **Headings**: H1, H2, H3 support
- **Lists**: Bullet points and numbered lists
- **Images**: Direct image upload and insertion
- **Undo/Redo**: Full editing history support
- **Clean UI**: Professional toolbar with hover states

**Location**: `components/ui/rich-text-editor.tsx`

---

### 3. **Comment Management** ✅
- **Edit Comments**: Comment authors can edit their own comments
- **Delete Comments**: Comment authors can delete their own comments
- **Admin Override**: Blog owner can edit/delete any comment
- **UI Actions**: Edit and Delete buttons appear for authors and admin
- **Confirmation**: Delete actions require user confirmation

**Location**: `components/web/CommentSection.tsx`

---

### 4. **Admin Dashboard** ✅
Admin-only page at `/admin` with:
- **Access Control**: Only blog owner can access
- **Statistics**: Total posts, published count, hidden count
- **Post Management**: View, toggle visibility (publish/hide), delete
- **Moderation UI**: Clean table layout with action buttons
- **Status Badges**: Visual indicators for post status

**Location**: `app/admin/page.tsx`

**Access**: Only accessible to users whose ID matches `NEXT_PUBLIC_ADMIN_ID`

---

### 5. **Table of Contents (OnThisPage)** ✅
- **Auto-generated TOC**: Extracts H2 and H3 headings from posts
- **Sticky Sidebar**: Follows user scroll on desktop
- **Active Highlighting**: Shows which section user is currently reading
- **Click Navigation**: Jump to sections by clicking TOC links

**Location**: `components/web/OnThisPage.tsx`

---

### 6. **Footer on All Pages** ✅
Footer now appears on:
- Home page (`/`)
- Blog listing page (`/posts`)
- Post detail pages (`/posts/[postId]`)
- Create post page (`/create`)

**Location**: `components/web/Footer.tsx`

---

### 7. **Ownership & Permissions** ✅
**Backend Enforcement** (Convex mutations):
- Users can only edit/delete their own posts and comments
- Admin (blog owner) can edit/delete any content
- All mutations validate user ownership before allowing actions
- Errors returned if user lacks permission

**Database Schema Updates**:
- Posts: `status` field (published, hidden, flagged)
- Comments: `status` field (visible, hidden)
- Automatic status assignment on creation

---

## 🔧 Setup Instructions

### Step 1: Create Your Account

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/sign-up`
3. Create your account (this will be the admin user)
4. **Note your User ID** from the browser console or network tab

### Step 2: Configure Admin User

After creating your account:

1. Open `.env.local`
2. Find the lines:
   ```
   ADMIN_USER_ID=
   NEXT_PUBLIC_ADMIN_ID=
   ```
3. Add your User ID to both:
   ```
   ADMIN_USER_ID=your_user_id_here
   NEXT_PUBLIC_ADMIN_ID=your_user_id_here
   ```
4. Restart your dev server

### Step 3: Verify Admin Access

1. Navigate to `http://localhost:3000/admin`
2. You should see the Admin Dashboard
3. If you get "Access Denied", check that your user IDs are correct

---

## 📊 Database Schema

### Posts Table
```typescript
{
  _id: Id<"posts">,
  title: string,
  body: string,
  contentHtml: string,  // Rich HTML from editor
  authorId: string,
  imageStorageId?: Id<"_storage">,
  status?: "published" | "hidden" | "flagged",
  _creationTime: number
}
```

### Comments Table
```typescript
{
  _id: Id<"comments">,
  postId: Id<"posts">,
  authorId: string,
  authorName: string,
  body: string,
  status?: "visible" | "hidden",
  _creationTime: number
}
```

### Rate Limits Table
```typescript
{
  _id: Id<"rateLimits">,
  userId: string,
  lastPostTime?: number,
  lastCommentTime?: number,
  dailyPostCount?: number,
  hourlyCommentCount?: number
}
```

---

## 🎯 Usage Examples

### Creating a Post
1. Go to `/create`
2. Enter title
3. (Optional) Upload featured image
4. Use the rich editor to write content:
   - Use toolbar buttons for formatting
   - Create headings (H1, H2, H3)
   - Add images by clicking the image button
   - Format lists and text
5. Click "Publish Article"

### Managing Comments
- **Edit**: Click "Edit" button on your comment, make changes, click "Save"
- **Delete**: Click "Delete" button, confirm in dialog
- **As Admin**: Edit/Delete buttons appear on all comments

### Admin Functions
1. Go to `/admin`
2. View all posts in the table
3. Toggle visibility (eye/eye-off icons)
4. Delete posts (trash icon)
5. View statistics at the top

---

## 🔐 Security

All mutations validate permissions at the backend:
- `createPost`: Requires authentication
- `updatePost`: Only author or admin
- `deletePost`: Only author or admin (also deletes all comments)
- `createComment`: Requires authentication + rate limit check
- `updateComment`: Only author or admin
- `deleteComment`: Only author or admin

**No client-side validation is trusted for security!**

---

## 📈 Rate Limiting Details

### Post Rate Limit
- **Limit**: 3 posts per 24 hours
- **Storage**: `rateLimits.dailyPostCount`
- **Reset**: Automatic after 24 hours from last post

### Comment Rate Limit
- **Limit**: 20 comments per 1 hour
- **Storage**: `rateLimits.hourlyCommentCount`
- **Reset**: Automatic after 1 hour from last comment

**Error Message Example**:
```
"Rate limit exceeded. You can post 3 times per day."
```

---

## 🛠️ File Structure

```
app/
├── admin/
│   └── page.tsx                 # Admin dashboard
├── (shared-layout)/
│   ├── create/
│   │   ├── layout.tsx          # Create page layout with footer
│   │   └── page.tsx            # Create post with rich editor
│   ├── posts/
│   │   ├── page.tsx            # Blog listing
│   │   └── [postId]/
│   │       ├── layout.tsx       # Post detail layout
│   │       └── page.tsx         # Post detail with rich content
│   └── page.tsx                # Home page (already had footer)

components/
├── ui/
│   ├── rich-text-editor.tsx    # TipTap editor component
│   └── rich-text-editor.css    # Editor styling
└── web/
    ├── CommentSection.tsx      # Updated with edit/delete
    ├── OnThisPage.tsx          # TOC auto-generation
    └── Footer.tsx              # Fixed for pre-rendering

convex/
├── schema.ts                    # Updated schema with status & rateLimits
├── posts.ts                     # Post mutations + rate limiting
├── comment.ts                   # Comment mutations + rate limiting
└── rateLimiting.ts             # Rate limit utilities

lib/
└── (existing auth files)
```

---

## 🚀 What's Next?

### Optional Enhancements
1. **Email Notifications**: Notify users of replies to their comments
2. **Search**: Full-text search for posts and comments
3. **Categories/Tags**: Organize posts by topic
4. **Draft Posts**: Allow saving drafts before publishing
5. **Reading Time**: Calculate and display estimated read time
6. **Analytics**: Track popular posts and user engagement
7. **Comments Moderation Queue**: Hold comments for review before publishing

### Performance Optimizations
1. **Image Optimization**: Resize images before upload
2. **Caching**: Implement longer cache times for static content
3. **Pagination**: Paginate blog listing for large archives
4. **Search Indexing**: Better full-text search with Convex indexes

---

## 🐛 Troubleshooting

### Admin Dashboard Shows "Access Denied"
- **Check**: Are your `ADMIN_USER_ID` and `NEXT_PUBLIC_ADMIN_ID` set in `.env.local`?
- **Verify**: Do they match your actual user ID?
- **Restart**: Did you restart the dev server after changing .env?

### Rate Limit Errors
- **Check**: Is the user hitting the limit legitimately?
- **Adjust**: Edit `convex/posts.ts` and `convex/comment.ts` to change limits
- **Reset**: Clear browser localStorage if testing needs cleanup

### Rich Editor Not Showing
- **Check**: Is TipTap installed? Run `npm list @tiptap/react`
- **Verify**: Are CSS imports correct in components/ui/rich-text-editor.tsx?

---

## 📝 Environment Variables

### Required for Production
```env
CONVEX_DEPLOYMENT=your_deployment_id
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CONVEX_SITE_URL=your_convex_site_url
NEXT_PUBLIC_SITE_URL=your_site_url

# Admin Setup
ADMIN_USER_ID=your_user_id
NEXT_PUBLIC_ADMIN_ID=your_user_id
```

---

## ✅ Testing Checklist

- [ ] Create a post using rich editor
- [ ] Verify headings appear in TOC
- [ ] Add comments to a post
- [ ] Edit your own comment
- [ ] Delete your own comment
- [ ] Try to edit another user's comment (should fail)
- [ ] Visit `/admin` with your admin user ID set
- [ ] View posts in admin dashboard
- [ ] Toggle post visibility
- [ ] Delete a post from admin panel
- [ ] Verify footer appears on all pages
- [ ] Test rate limiting (create 4 posts, see error on 4th)

---

## 🎓 Learning Resources

- **TipTap Docs**: https://tiptap.dev
- **Convex Docs**: https://docs.convex.dev
- **Next.js 16 Docs**: https://nextjs.org/docs
- **Shadcn/UI**: https://ui.shadcn.com

---

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Review the Convex dashboard for mutation logs
3. Verify environment variables are set correctly
4. Ensure you're logged in before accessing protected features

---

**The Web Room is now fully functional!** 🚀
