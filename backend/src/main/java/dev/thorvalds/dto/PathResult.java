package dev.thorvalds.dto;

import java.util.List;

/**
 * Result of a path calculation to Torvalds.
 *
 * @param thorvaldsNumber The number of repositories in the shortest path
 * @param pathNodes       Ordered list of nodes (alternating
 *                        Developer/Repository)
 * @param found           Whether a path was found
 * @param errorMessage    Error message if any issue occurred
 */
public record PathResult(
        int thorvaldsNumber,
        List<PathNode> pathNodes,
        boolean found,
        String errorMessage) {

    public static PathResult notFound(String username) {
        return new PathResult(0, List.of(), false, "User '" + username + "' not found in database");
    }

    public static PathResult noPath(String username) {
        return new PathResult(0, List.of(), false, "No path found from '" + username + "' to torvalds");
    }

    public static PathResult success(int number, List<PathNode> nodes) {
        return new PathResult(number, nodes, true, null);
    }
}
