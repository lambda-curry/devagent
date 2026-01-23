#!/usr/bin/env bun
/**
 * Git Manager Tool
 *
 * Provides robust git capabilities for the BranchManager role, including:
 * - Creating feature/hub branches
 * - Checking out feature branches off hub
 * - Performing git rebase with conflict handling (theirs/ours strategies)
 *
 * Usage:
 *   import { createHubBranch, checkoutFeatureBranch, rebaseBranch } from './git-manager';
 *
 *   await createHubBranch('feature/objective-hub', 'main');
 *   await checkoutFeatureBranch('feature/objective-epic-a', 'feature/objective-hub');
 *   await rebaseBranch('feature/objective-epic-a', 'origin/feature/objective-hub', { strategy: 'theirs' });
 */

import { execSync } from 'node:child_process';

// Types
export interface GitManagerOptions {
  /** Working directory for git operations (default: process.cwd()) */
  cwd?: string;
  /** Whether to push after creating branch (default: true) */
  push?: boolean;
  /** Whether to pull before operations (default: true) */
  pull?: boolean;
}

export interface RebaseOptions extends GitManagerOptions {
  /** Conflict resolution strategy: 'theirs' (epic changes win) or 'ours' (hub changes win) */
  strategy?: 'theirs' | 'ours';
  /** Whether to abort on complex conflicts (default: true) */
  abortOnComplex?: boolean;
  /** Maximum number of conflicts to resolve automatically (default: 10) */
  maxConflicts?: number;
}

export interface ConflictInfo {
  file: string;
  strategy: 'theirs' | 'ours' | 'manual';
}

export interface RebaseResult {
  success: boolean;
  conflicts?: ConflictInfo[];
  aborted?: boolean;
  error?: string;
}

/**
 * Execute a git command and return output
 */
function execGit(command: string, options: GitManagerOptions = {}): string {
  const cwd = options.cwd || process.cwd();
  try {
    return execSync(command, {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
  } catch (error: unknown) {
    const err = error as { stderr?: string; stdout?: string; message?: string };
    throw new Error(
      `Git command failed: ${command}\n` +
        `Error: ${err.message || 'Unknown error'}\n` +
        `Stderr: ${err.stderr || ''}\n` +
        `Stdout: ${err.stdout || ''}`
    );
  }
}

/**
 * Check if a branch exists (locally or remotely)
 */
function branchExists(branchName: string, options: GitManagerOptions = {}): boolean {
  try {
    // Check local branches
    const localBranches = execGit('git branch --format="%(refname:short)"', options);
    if (localBranches.split('\n').includes(branchName)) {
      return true;
    }

    // Check remote branches
    const remoteBranches = execGit('git branch -r --format="%(refname:short)"', options);
    const remoteBranchName = `origin/${branchName}`;
    if (remoteBranches.split('\n').includes(remoteBranchName)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Get current branch name
 */
function _getCurrentBranch(options: GitManagerOptions = {}): string {
  return execGit('git branch --show-current', options);
}

/**
 * Check if working directory is clean
 */
function isWorkingDirectoryClean(options: GitManagerOptions = {}): boolean {
  try {
    const status = execGit('git status --porcelain', options);
    return status === '';
  } catch {
    return false;
  }
}

/**
 * Create a hub branch from a base branch
 *
 * @param hubBranchName - Name of the hub branch (e.g., 'feature/objective-hub')
 * @param baseBranch - Base branch to create from (e.g., 'main')
 * @param options - Git manager options
 * @returns The created branch name
 */
export function createHubBranch(
  hubBranchName: string,
  baseBranch: string = 'main',
  options: GitManagerOptions = {}
): string {
  const shouldPush = options.push !== false;
  const shouldPull = options.pull !== false;

  // Check if hub branch already exists
  if (branchExists(hubBranchName, options)) {
    throw new Error(`Hub branch '${hubBranchName}' already exists`);
  }

  // Ensure working directory is clean
  if (!isWorkingDirectoryClean(options)) {
    throw new Error('Working directory is not clean. Please commit or stash changes before creating hub branch.');
  }

  // Checkout base branch and pull latest
  if (shouldPull) {
    execGit(`git checkout ${baseBranch}`, options);
    execGit(`git pull origin ${baseBranch}`, options);
  } else {
    execGit(`git checkout ${baseBranch}`, options);
  }

  // Create hub branch
  execGit(`git checkout -b ${hubBranchName}`, options);

  // Push hub branch if requested
  if (shouldPush) {
    execGit(`git push -u origin ${hubBranchName}`, options);
  }

  return hubBranchName;
}

/**
 * Checkout a feature branch off the hub (or create it if it doesn't exist)
 *
 * @param featureBranchName - Name of the feature branch (e.g., 'feature/objective-epic-a')
 * @param baseBranch - Base branch to create from (e.g., 'feature/objective-hub')
 * @param options - Git manager options
 * @returns The branch name (created or checked out)
 */
export function checkoutFeatureBranch(
  featureBranchName: string,
  baseBranch: string,
  options: GitManagerOptions = {}
): string {
  const shouldPush = options.push !== false;
  const shouldPull = options.pull !== false;

  // Ensure working directory is clean
  if (!isWorkingDirectoryClean(options)) {
    throw new Error(
      'Working directory is not clean. Please commit or stash changes before checking out feature branch.'
    );
  }

  // Checkout base branch and pull latest
  if (shouldPull) {
    execGit(`git checkout ${baseBranch}`, options);
    execGit(`git pull origin ${baseBranch}`, options);
  } else {
    execGit(`git checkout ${baseBranch}`, options);
  }

  // Check if feature branch exists
  if (branchExists(featureBranchName, options)) {
    // Checkout existing branch
    execGit(`git checkout ${featureBranchName}`, options);
    if (shouldPull) {
      execGit(`git pull origin ${featureBranchName}`, options);
    }
  } else {
    // Create new branch
    execGit(`git checkout -b ${featureBranchName}`, options);

    // Push new branch if requested
    if (shouldPush) {
      execGit(`git push -u origin ${featureBranchName}`, options);
    }
  }

  return featureBranchName;
}

/**
 * Get list of conflicted files during a merge/rebase
 */
function getConflictedFiles(options: GitManagerOptions = {}): string[] {
  try {
    const status = execGit('git status --porcelain', options);
    const conflictedFiles: string[] = [];

    for (const line of status.split('\n')) {
      if (line.match(/^AA|^UU|^DD|^AU|^UA|^DU|^UD/)) {
        const file = line.substring(3).trim();
        conflictedFiles.push(file);
      }
    }

    return conflictedFiles;
  } catch {
    return [];
  }
}

/**
 * Resolve conflicts using a strategy (theirs or ours)
 */
function resolveConflicts(files: string[], strategy: 'theirs' | 'ours', options: GitManagerOptions = {}): void {
  for (const file of files) {
    if (strategy === 'theirs') {
      execGit(`git checkout --theirs "${file}"`, options);
    } else {
      execGit(`git checkout --ours "${file}"`, options);
    }
    execGit(`git add "${file}"`, options);
  }
}

/**
 * Perform git rebase with conflict handling
 *
 * @param branchName - Branch to rebase (e.g., 'feature/objective-epic-a')
 * @param baseBranch - Base branch to rebase onto (e.g., 'origin/feature/objective-hub')
 * @param options - Rebase options including conflict resolution strategy
 * @returns Rebase result with success status and conflict information
 */
export function rebaseBranch(branchName: string, baseBranch: string, options: RebaseOptions = {}): RebaseResult {
  const strategy = options.strategy || 'theirs';
  const abortOnComplex = options.abortOnComplex !== false;
  const maxConflicts = options.maxConflicts || 10;
  const shouldPull = options.pull !== false;

  // Ensure working directory is clean
  if (!isWorkingDirectoryClean(options)) {
    return {
      success: false,
      error: 'Working directory is not clean. Please commit or stash changes before rebasing.'
    };
  }

  // Checkout branch and pull latest
  try {
    execGit(`git checkout ${branchName}`, options);
    if (shouldPull) {
      execGit(`git pull origin ${branchName}`, options);
    }
  } catch (error: unknown) {
    return {
      success: false,
      error: `Failed to checkout branch: ${error instanceof Error ? error.message : String(error)}`
    };
  }

  // Start rebase
  try {
    execGit(`git rebase ${baseBranch}`, options);

    // If rebase completes without conflicts, we're done
    return { success: true };
  } catch (error: unknown) {
    // Rebase likely hit conflicts - check for conflicted files
    const conflictedFiles = getConflictedFiles(options);

    if (conflictedFiles.length === 0) {
      // No conflicts but rebase failed - might be a different error
      return {
        success: false,
        error: `Rebase failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }

    // Too many conflicts - abort if configured
    if (conflictedFiles.length > maxConflicts && abortOnComplex) {
      try {
        execGit('git rebase --abort', options);
      } catch {
        // Ignore abort errors
      }
      return {
        success: false,
        aborted: true,
        error: `Too many conflicts (${conflictedFiles.length} > ${maxConflicts}). Aborted.`,
        conflicts: conflictedFiles.map(file => ({ file, strategy: 'manual' as const }))
      };
    }

    // Resolve conflicts using strategy
    const conflicts: ConflictInfo[] = [];
    try {
      resolveConflicts(conflictedFiles, strategy, options);
      conflicts.push(...conflictedFiles.map(file => ({ file, strategy })));
    } catch (resolveError: unknown) {
      // Failed to resolve - abort
      try {
        execGit('git rebase --abort', options);
      } catch {
        // Ignore abort errors
      }
      return {
        success: false,
        aborted: true,
        error: `Failed to resolve conflicts: ${resolveError instanceof Error ? resolveError.message : String(resolveError)}`,
        conflicts: conflictedFiles.map(file => ({ file, strategy: 'manual' as const }))
      };
    }

    // Continue rebase after resolving conflicts
    try {
      execGit('git rebase --continue', options);

      // Rebase might have more conflicts - check again
      const remainingConflicts = getConflictedFiles(options);
      if (remainingConflicts.length > 0) {
        // More conflicts - abort if configured
        if (remainingConflicts.length > maxConflicts && abortOnComplex) {
          try {
            execGit('git rebase --abort', options);
          } catch {
            // Ignore abort errors
          }
          return {
            success: false,
            aborted: true,
            error: `Additional conflicts detected (${remainingConflicts.length}). Aborted.`,
            conflicts: [...conflicts, ...remainingConflicts.map(file => ({ file, strategy: 'manual' as const }))]
          };
        }

        // Resolve additional conflicts
        resolveConflicts(remainingConflicts, strategy, options);
        conflicts.push(...remainingConflicts.map(file => ({ file, strategy })));

        // Continue again
        execGit('git rebase --continue', options);
      }

      return { success: true, conflicts };
    } catch (continueError: unknown) {
      // Rebase continue failed - might have more conflicts or other issues
      const remainingConflicts = getConflictedFiles(options);

      if (remainingConflicts.length > 0) {
        // More conflicts detected
        if (remainingConflicts.length > maxConflicts && abortOnComplex) {
          try {
            execGit('git rebase --abort', options);
          } catch {
            // Ignore abort errors
          }
          return {
            success: false,
            aborted: true,
            error: `Additional conflicts detected (${remainingConflicts.length}). Aborted.`,
            conflicts: [...conflicts, ...remainingConflicts.map(file => ({ file, strategy: 'manual' as const }))]
          };
        }

        // Try to resolve and continue recursively (but limit depth)
        return rebaseBranch(branchName, baseBranch, {
          ...options,
          // Prevent infinite recursion by reducing max conflicts
          maxConflicts: Math.max(1, maxConflicts - remainingConflicts.length)
        });
      }

      // No more conflicts but continue failed - might be a different error
      return {
        success: false,
        error: `Rebase continue failed: ${continueError instanceof Error ? continueError.message : String(continueError)}`,
        conflicts
      };
    }
  }
}

/**
 * Force push a branch with lease (safer than --force)
 *
 * @param branchName - Branch to push
 * @param options - Git manager options
 */
export function forcePushWithLease(branchName: string, options: GitManagerOptions = {}): void {
  execGit(`git push --force-with-lease origin ${branchName}`, options);
}

/**
 * Merge a branch into another branch
 *
 * @param sourceBranch - Branch to merge from
 * @param targetBranch - Branch to merge into
 * @param options - Git manager options
 * @returns Merge result
 */
export function mergeBranch(
  sourceBranch: string,
  targetBranch: string,
  options: GitManagerOptions & { noff?: boolean; message?: string } = {}
): { success: boolean; error?: string } {
  const shouldPull = options.pull !== false;
  const noff = options.noff !== false; // Default to --no-ff
  const message = options.message || `Merge ${sourceBranch} into ${targetBranch}`;

  // Ensure working directory is clean
  if (!isWorkingDirectoryClean(options)) {
    return {
      success: false,
      error: 'Working directory is not clean. Please commit or stash changes before merging.'
    };
  }

  try {
    // Checkout target branch and pull latest
    execGit(`git checkout ${targetBranch}`, options);
    if (shouldPull) {
      execGit(`git pull origin ${targetBranch}`, options);
    }

    // Merge source branch
    const mergeCmd = noff
      ? `git merge ${sourceBranch} --no-ff -m "${message}"`
      : `git merge ${sourceBranch} -m "${message}"`;

    execGit(mergeCmd, options);

    return { success: true };
  } catch (error: unknown) {
    // Check for conflicts
    const conflictedFiles = getConflictedFiles(options);

    if (conflictedFiles.length > 0) {
      return {
        success: false,
        error: `Merge conflicts detected in ${conflictedFiles.length} file(s): ${conflictedFiles.join(', ')}`
      };
    }

    return {
      success: false,
      error: `Merge failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
