package dev.thorvalds.service;

import dev.thorvalds.dto.PathNode;
import dev.thorvalds.dto.PathResult;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Record;
import org.neo4j.driver.Session;
import org.neo4j.driver.types.Node;
import org.neo4j.driver.types.Path;
import org.neo4j.driver.types.Relationship;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for graph operations, primarily finding the shortest path to
 * Torvalds.
 */
@Service
public class GraphService {

    private static final String TORVALDS_USERNAME = "torvalds";

    private final Driver driver;

    public GraphService(Driver driver) {
        this.driver = driver;
    }

    /**
     * Find the shortest path from a username to Torvalds.
     * Uses undirected pathfinding treating CONTRIBUTED_TO as bidirectional.
     */
    public PathResult findPathToTorvalds(String username) {
        if (username == null || username.isBlank()) {
            return PathResult.notFound("(empty)");
        }

        String normalizedUsername = username.trim().toLowerCase();

        // Handle case where user IS torvalds
        if (normalizedUsername.equals(TORVALDS_USERNAME)) {
            return PathResult.success(0, List.of(
                    PathNode.developer(null, TORVALDS_USERNAME)));
        }

        try (Session session = driver.session()) {
            // Find shortest path treating relationships as undirected
            String query = """
                    MATCH (start:Developer {username: $username})
                    MATCH (end:Developer {username: $torvalds})
                    MATCH path = shortestPath((start)-[:CONTRIBUTED_TO*]-(end))
                    RETURN path
                    """;

            var result = session.run(query,
                    org.neo4j.driver.Values.parameters(
                            "username", normalizedUsername,
                            "torvalds", TORVALDS_USERNAME));

            if (!result.hasNext()) {
                // Check if user exists
                var userCheck = session.run(
                        "MATCH (d:Developer {username: $username}) RETURN d",
                        org.neo4j.driver.Values.parameters("username", normalizedUsername));

                if (!userCheck.hasNext()) {
                    return PathResult.notFound(username);
                }
                return PathResult.noPath(username);
            }

            Record record = result.next();
            Path path = record.get("path").asPath();

            return extractPathResult(path);
        }
    }

    private PathResult extractPathResult(Path path) {
        List<PathNode> nodes = new ArrayList<>();
        int repoCount = 0;

        // Process nodes in the path
        for (Node node : path.nodes()) {
            if (node.hasLabel("Developer")) {
                String username = node.get("username").asString();
                Long githubId = node.get("github_id").asLong();
                nodes.add(PathNode.developer(githubId, username));
            } else if (node.hasLabel("Repository")) {
                String name = node.get("name").asString();
                Long githubId = node.get("github_id").asLong();
                nodes.add(PathNode.repository(githubId, name));
                repoCount++;
            }
        }

        return PathResult.success(repoCount, nodes);
    }

    /**
     * Get database statistics for display.
     */
    public DatabaseStats getStats() {
        try (Session session = driver.session()) {
            var result = session.run("""
                    MATCH (d:Developer) WITH count(d) as devs
                    MATCH (r:Repository) WITH devs, count(r) as repos
                    RETURN devs, repos
                    """);

            if (result.hasNext()) {
                Record record = result.next();
                return new DatabaseStats(
                        record.get("devs").asLong(),
                        record.get("repos").asLong());
            }
            return new DatabaseStats(0, 0);
        }
    }

    public record DatabaseStats(long developers, long repositories) {
        public long total() {
            return developers + repositories;
        }
    }
}
