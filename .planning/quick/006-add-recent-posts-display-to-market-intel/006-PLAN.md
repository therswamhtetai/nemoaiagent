---
task: 006
type: quick
title: Add Recent Posts Display to Market Intel Modal
files_modified: [app/page.tsx]
autonomous: true
---

<objective>
Add a "Recent Posts" section to the competitor detail modal in Market Intelligence that displays photo/video thumbnails, captions, and direct links for the 5 most recently scraped posts.

Purpose: Users can visually browse competitor content without leaving the dashboard
Output: Grid of post cards with thumbnails, truncated captions, and clickable links
</objective>

<context>
@CLAUDE.md
@app/page.tsx (lines 4767-4823 - existing modal sections)
@lib/types.ts (SocialStat interface with recent_posts: any)

**Data structure (Apify JSON in recent_posts):**
```typescript
interface ApifyPost {
  image?: string           // Main image URL
  images?: string[]        // Array of image URLs
  videoUrl?: string        // Video URL (for video posts)
  videoThumbnail?: string  // Video thumbnail
  text?: string            // Post caption
  url: string              // Direct link to post
  isVideo?: boolean        // Video indicator
}
```

**Insert location:** After the "Top Performing Post" section (~line 4823), before the closing `</>` at line 4824
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add Recent Posts grid section to competitor modal</name>
  <files>app/page.tsx</files>
  <action>
Add a new section after the "Top Performing Post" section (~line 4823) with the following structure:

1. **Parse recent_posts safely:**
```typescript
{(() => {
  // Parse recent_posts - could be string JSON or already parsed array
  let posts: any[] = [];
  try {
    if (selectedCompetitor.stats.recent_posts) {
      posts = typeof selectedCompetitor.stats.recent_posts === 'string'
        ? JSON.parse(selectedCompetitor.stats.recent_posts)
        : selectedCompetitor.stats.recent_posts;
    }
  } catch { posts = []; }
  
  if (!Array.isArray(posts) || posts.length === 0) return null;
  // ... render grid
})()}
```

2. **Section container:**
- Use same styling pattern as other sections: `p-4 bg-white/5 rounded-lg border border-white/10`
- Header: "📸 Recent Posts" with same styling as other headers

3. **Grid layout:**
- Use `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3` for responsive 5-column layout
- Each card: thumbnail container + caption + external link

4. **Post card structure for each of the 5 posts:**
```tsx
<a 
  href={post.url} 
  target="_blank" 
  rel="noopener noreferrer"
  className="group block bg-[#1A1918] rounded-lg border border-[#2A2826] overflow-hidden hover:border-white/30 transition-colors"
>
  {/* Thumbnail - square aspect ratio */}
  <div className="aspect-square relative bg-black/20">
    <img 
      src={post.videoThumbnail || post.image || post.images?.[0] || '/placeholder.png'}
      alt=""
      className="w-full h-full object-cover"
    />
    {/* Video indicator overlay */}
    {(post.isVideo || post.videoUrl) && (
      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
        <span className="text-2xl">▶️</span>
      </div>
    )}
  </div>
  {/* Caption */}
  <div className="p-2">
    <p className="text-xs text-white/70 line-clamp-2">
      {post.text || 'No caption'}
    </p>
  </div>
</a>
```

5. **Limit to 5 posts:** Use `.slice(0, 5)` when mapping over posts

6. **Fallback for missing thumbnails:** Use a placeholder or gradient background
  </action>
  <verify>
- `npm run build` completes without TypeScript errors
- Modal displays "Recent Posts" section when competitor has stats with recent_posts data
- Grid shows up to 5 posts with thumbnails
- Clicking a post opens the original URL in a new tab
- Video posts show play button overlay
  </verify>
  <done>
- Recent Posts section visible in competitor modal
- Thumbnails render correctly for photo and video posts
- Captions truncated to 2 lines with line-clamp
- External links open in new tabs
- Responsive grid: 2 cols mobile, 3 cols tablet, 5 cols desktop
  </done>
</task>

</tasks>

<verification>
1. Open Market Intelligence tab
2. Click on a competitor with scraped data
3. Scroll down in modal to see "Recent Posts" section
4. Verify thumbnails load (or show placeholder if no image)
5. Verify video posts have play button overlay
6. Click a post thumbnail - should open original post URL
7. Check responsive behavior at different breakpoints
</verification>

<success_criteria>
- Build passes with no TypeScript errors
- Recent Posts section displays after Top Performing Post
- Shows up to 5 posts in a responsive grid
- Video posts visually distinguished with play overlay
- External links work correctly (new tab)
- Graceful handling of missing data (no crashes)
</success_criteria>

<output>
After completion, create `.planning/quick/006-add-recent-posts-display-to-market-intel/006-SUMMARY.md`
</output>
