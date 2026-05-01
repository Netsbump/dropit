---
name: handoff
description: Write or update a project HANDOFF.md so the next agent can continue work with fresh context. Use when the user asks for a handoff, context transfer, or session summary for continuation.
---

# Handoff

Write or update a handoff document so the next agent with fresh context can continue this work.

## Workflow

1. Check whether `HANDOFF.md` already exists in the project root.
2. If it exists, read it first to preserve and extend prior context.
3. Create or update `HANDOFF.md` with these sections:
   - **Goal**: What we are trying to accomplish
   - **Current Progress**: What has been done so far
   - **What Worked**: Approaches that succeeded
   - **What Did Not Work**: Approaches that failed (so they are not repeated)
   - **Next Steps**: Clear action items to continue
4. Keep content factual, concise, and implementation-oriented.
5. Save the document as `HANDOFF.md` in the project root.
6. In your final response, explicitly give the path to the file so the user can restart with only that path.
