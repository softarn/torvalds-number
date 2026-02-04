package dev.thorvalds.dto;

/**
 * A node in the path, either a Developer or Repository.
 *
 * @param type         "developer" or "repository"
 * @param githubId     The GitHub ID
 * @param displayName  Username or repo name for display
 * @param totalCommits Commits (only for relationship edges)
 * @param linesAdded   Lines added (only for relationship edges)
 * @param language     Primary language (only for relationship edges)
 */
public record PathNode(
        String type,
        Long githubId,
        String displayName,
        Integer totalCommits,
        Integer linesAdded,
        String language) {

    public static PathNode developer(Long githubId, String username) {
        return new PathNode("developer", githubId, username, null, null, null);
    }

    public static PathNode repository(Long githubId, String name) {
        return new PathNode("repository", githubId, name, null, null, null);
    }

    public static PathNode repositoryWithFacts(Long githubId, String name, Integer commits, Integer lines,
            String lang) {
        return new PathNode("repository", githubId, name, commits, lines, lang);
    }
}
