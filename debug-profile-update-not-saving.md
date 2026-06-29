# Debug Session: profile-update-not-saving

## Session Info
- **Date Started**: 2026-06-29
- **Status**: OPEN
- **Description**: User reports that updating profile and header banner doesn't work; the page seems to still be using mock data.

---

## Hypotheses
Let's list 3-5 possible causes for this issue:

1. **Upload endpoint not returning proper URL**: The `/api/superadmin/upload` endpoint is not returning a valid image URL to the update profile page, so the state doesn't update correctly.
2. **Supabase upsert failing silently**: The profile upsert to Supabase is failing but not showing an error to the user.
3. **Cached data on client**: The profile page is using cached data and not fetching fresh data after update.
4. **Session/auth issue**: The user session isn't correctly associated with the profile ID being updated.
5. **Type mismatch or form state issue**: The form state isn't correctly binding or the data types don't match what Supabase expects.

---

## Logs
Will be populated as we collect runtime evidence!
