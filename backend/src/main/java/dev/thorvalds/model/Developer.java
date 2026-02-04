package dev.thorvalds.model;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

/**
 * Represents a GitHub developer/user in the graph.
 */
@Node("Developer")
public class Developer {

    @Id
    @Property("github_id")
    private Long githubId;

    private String username;

    @Relationship(type = "CONTRIBUTED_TO", direction = Relationship.Direction.OUTGOING)
    private Set<ContributedTo> contributions = new HashSet<>();

    public Developer() {
    }

    public Developer(Long githubId, String username) {
        this.githubId = githubId;
        this.username = username;
    }

    public Long getGithubId() {
        return githubId;
    }

    public void setGithubId(Long githubId) {
        this.githubId = githubId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Set<ContributedTo> getContributions() {
        return contributions;
    }

    public void setContributions(Set<ContributedTo> contributions) {
        this.contributions = contributions;
    }
}
