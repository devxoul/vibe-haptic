# Release Command

Bump version and create a new release.

## Arguments

- `$ARGUMENTS` - The new version number (e.g., `1.0.5`)

## Version Files to Update

Update the version in these files:

1. **package.json** (line 3) - `"version": "X.X.X"`
2. **.claude-plugin/plugin.json** (line 3) - `"version": "X.X.X"`
3. **README.md** (line 38) - `vibe-haptic@X.X.X` in the OpenCode installation section

## Release Steps

### Step 1: Validate Version Argument

Ensure `$ARGUMENTS` is provided and is a valid semver version (e.g., `1.0.5`).
If not provided, ask the user for the version number.

### Step 2: Update Version in All Files

Update the version string in each file listed above. Use the Edit tool for precise updates.

### Step 3: Build

Run the build command:
```bash
bun clean && bun run build
```

Ensure the build succeeds before proceeding.

### Step 4: Create Commit

Stage and commit all changes including:
- Version file changes (package.json, plugin.json, README.md)
- Build output (dist/, native/*.node)

Commit message format:
```
$ARGUMENTS
```

### Step 5: Create Tag and Push

Create a git tag **without** the `v` prefix:
```bash
git tag $ARGUMENTS
git push origin main
git push origin $ARGUMENTS
```

### Step 6: Create GitHub Release

Create a GitHub release using `gh release create`:
- Tag: `$ARGUMENTS` (no `v` prefix)
- Title: `$ARGUMENTS` (no `v` prefix)
- Generate release notes automatically

```bash
gh release create $ARGUMENTS --title "$ARGUMENTS" --generate-notes
```

### Step 7: Publish to npm

Publish the package to npm registry:
```bash
npm publish
```

Note: The `prepublishOnly` script in package.json will run `bun run build` automatically, but since we already built in Step 3, this is redundant but harmless.

## Important Notes

- **No `v` prefix**: Tags and release titles must NOT include the `v` prefix (use `1.0.5` not `v1.0.5`)
- **Build artifacts**: The commit must include the build output in `dist/` and `native/*.node`
- **Clean build**: Always run `bun clean` before building to ensure fresh artifacts
