package dev.thorvalds.model;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;

/**
 * Represents a GitHub repository in the graph.
 */
@Node("Repository")
public class Repository {

    @Id
    @Property("github_id")
    private Long githubId;

    private String name;

    public Repository() {
    }

    public Repository(Long githubId, String name) {
        this.githubId = githubId;
        this.name = name;
    }

    public Long getGithubId() {
        return githubId;
    }

    public void setGithubId(Long githubId) {
        this.githubId = githubId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
