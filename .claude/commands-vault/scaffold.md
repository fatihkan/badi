Code scaffolding command. Analyzes project structure and generates consistent module, component, or API skeletons.

# Required Tools
- Read (existing code patterns)
- Write (scaffold files)
- Grep (pattern scan)
- Glob (file structure analysis)
- Agent (code-generator agent)

# Procedure (5 Steps)

### Step 1: Determine the Scaffold Type
Learn from the user what to create:
- **Module/Component** — A new UI component or business-logic module
- **API Endpoint** — A new REST/GraphQL endpoint set
- **CRUD** — Full CRUD operations from a model definition
- **Test** — Test scaffolding for existing code
- **Migration** — A database migration file
- **Middleware** — Middleware skeleton
- **Service** — A new service class/module

### Step 2: Analyze the Project Patterns
Scan the existing project structure:
- Directory layout and naming conventions
- Import/export patterns
- Error-handling approach
- Test file placement
- Type definition styles

### Step 3: Delegate to the Code-Generator Agent
Pass the agent:
- Scaffold type and target name
- The detected project patterns
- Existing files to use as references

### Step 4: Create the Files
Write the generated scaffold to disk:
- Create the new files
- Update the necessary index/barrel files
- Add the imports

### Step 5: Verify
- Check the generated files match the project conventions
- Verify there are no TypeScript/lint errors
- List the next steps (TODO-marked spots)

# Output Format
```
=== BADI SCAFFOLD ===
Type: [module/api/crud/test/migration]
Name: [component name]

Created Files:
  + [file path] (new)
  ~ [file path] (updated)

Next: add business logic at the TODO-marked spots.
====================
```
