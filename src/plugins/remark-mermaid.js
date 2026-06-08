import { visit } from "unist-util-visit";


export function remarkMermaid() {
    return (tree) => {
        visit(tree, "code", (node) => {
            if (node.lang === "mermaid") {
                // Convert the mermaid code block into a custom node type
                node.type = "mermaid";
                node.data = {
                    hName: "div",
                    hProperties: {
                        className: ["mermaid-container"],
                        "data-mermaid-code": node.value,
                    },
                };
            }
        });
    };
}