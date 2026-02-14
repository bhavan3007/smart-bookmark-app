# Smart Bookmark App – Challenges Faced & Solutions

## 1. Supabase RLS Policies Confusion
**Problem:** I was confused about where to add SQL conditions while creating Row Level Security policies in Supabase.  
**Solution:** I learned that only the condition should be added inside the policy editor using:
auth.uid() = user_id
and created SELECT, INSERT, UPDATE, and DELETE policies.

---


## 2. Vercel Build TypeScript Error
**Problem:** Deployment failed because the cleanup function in useEffect returned a Promise.  
**Solution:** I fixed it by changing the cleanup function to:
return () => {
supabase.removeChannel(channel);
};


---

## 3. Redirect URL Errors After Deployment
**Problem:** Login worked locally but failed after deploying because the redirect URL was set to localhost.  
**Solution:** I fixed this by using a dynamic redirect:
redirectTo: ${window.location.origin}/dashboard

and updated redirect URLs in Supabase settings.

---
