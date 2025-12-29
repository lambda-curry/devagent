# Linear MCP Functions Reference

Complete reference for all available Linear MCP server functions.

## Issue Operations

**List Issues:**
- `mcp_Linear_list_issues` - List and filter issues with various criteria
  - Filters: `team`, `state`, `assignee`, `label`, `project`, `cycle`, `query`
  - Supports pagination: `limit`, `before`, `after`
  - Ordering: `orderBy` (createdAt, updatedAt)

**Get Issue Details:**
- `mcp_Linear_get_issue` - Get detailed issue information
  - Includes: title, description, state, assignee, labels, project, comments
  - Option: `includeRelations` for blocking/related issues

**Create/Update Issues:**
- `mcp_Linear_create_issue` - Create new issues
- `mcp_Linear_update_issue` - Update existing issues
  - Supports: title, description, state, assignee, labels, project, priority, dueDate

**Issue Comments:**
- `mcp_Linear_list_comments` - List comments for an issue
- `mcp_Linear_create_comment` - Create comments on issues

## Project Operations

**List/Get Projects:**
- `mcp_Linear_list_projects` - List projects with filters
- `mcp_Linear_get_project` - Get project details
- `mcp_Linear_create_project` - Create new projects
- `mcp_Linear_update_project` - Update projects

## Team Operations

**List/Get Teams:**
- `mcp_Linear_list_teams` - List teams in workspace
- `mcp_Linear_get_team` - Get team details

## User Operations

**List/Get Users:**
- `mcp_Linear_list_users` - List workspace users
- `mcp_Linear_get_user` - Get user details
  - Use `"me"` as query to get current user

## Status and Labels

**Issue Statuses:**
- `mcp_Linear_list_issue_statuses` - List available statuses for a team
- `mcp_Linear_get_issue_status` - Get status details

**Issue Labels:**
- `mcp_Linear_list_issue_labels` - List labels
- `mcp_Linear_create_issue_label` - Create new labels

## Cycles

**List Cycles:**
- `mcp_Linear_list_cycles` - List cycles for a team
  - Types: `current`, `previous`, `next`

## Documents

**Document Operations:**
- `mcp_Linear_list_documents` - List documents
- `mcp_Linear_get_document` - Get document by ID or slug
- `mcp_Linear_create_document` - Create documents
- `mcp_Linear_update_document` - Update documents

## Issue ID Formats

Linear issues can be referenced by:
- **Issue ID**: Full UUID (e.g., `"550e8400-e29b-41d4-a716-446655440000"`)
- **Issue Identifier**: Team key + number (e.g., `"LIN-123"`)
- **Issue Key**: Just the number (e.g., `"123"`) - requires team context

**Best Practice:** Use full issue identifier (`"LIN-123"`) when possible for clarity.

## Filtering and Search

### List Issues with Filters

**By Team:**
```typescript
mcp_Linear_list_issues({
  team: "Engineering",
  state: "In Progress"
})
```

**By Assignee:**
```typescript
mcp_Linear_list_issues({
  assignee: "me", // or user ID/email
  state: "Todo"
})
```

**By Label:**
```typescript
mcp_Linear_list_issues({
  label: "bug",
  state: "Backlog"
})
```

**By Query (Full-text Search):**
```typescript
mcp_Linear_list_issues({
  query: "authentication",
  team: "Engineering"
})
```

## Error Handling

- **Issue not found:** Verify issue ID format and workspace access
- **Authentication errors:** Check MCP server configuration
- **Rate limiting:** Linear API has rate limits; implement retry logic
- **Missing permissions:** Verify workspace access and API token scope

## Best Practices

1. **Cache issue data** when reviewing multiple PRs
2. **Use includeRelations** when checking dependencies
3. **Filter efficiently** using team/state/assignee filters
4. **Handle pagination** for large result sets (use `limit`, `after`)
5. **Extract issue IDs** from PR context before fetching
6. **Update issues** with review findings for traceability

## References

- Linear API Documentation: [developers.linear.app/docs](https://developers.linear.app/docs)
- Linear GraphQL API: [developers.linear.app/docs/graphql](https://developers.linear.app/docs/graphql)
- Linear API Reference: [developers.linear.app/docs/api-reference](https://developers.linear.app/docs/api-reference)
