package dev.thorvalds.controller;

import dev.thorvalds.dto.PathResult;
import dev.thorvalds.service.GraphService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Controller for the HTMX-powered UI.
 */
@Controller
public class CalculateController {

    private final GraphService graphService;

    public CalculateController(GraphService graphService) {
        this.graphService = graphService;
    }

    @GetMapping("/")
    public String index(Model model) {
        var stats = graphService.getStats();
        model.addAttribute("stats", stats);
        return "index";
    }

    @PostMapping("/calculate")
    public String calculate(@RequestParam String username, Model model) {
        PathResult result = graphService.findPathToTorvalds(username);
        model.addAttribute("result", result);
        model.addAttribute("username", username);
        return "fragments/path :: result";
    }
}
