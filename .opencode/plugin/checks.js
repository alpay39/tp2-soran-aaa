// Enregistrement explicite dans opencode.json, sans dépendre du nom du dossier.
export const ChecksPlugin = async ({ $, directory }) => ({
  "tool.execute.after": async (input, output) => {
    // Tous les outils pouvant éditer, y compris patch/bash et les configs JS/JSON.
    if (!["edit", "write", "apply_patch", "patch", "bash"].includes(input.tool)) return;
    if (input.tool === "bash" && /scripts\/checks\.sh|npm run (check|verify)/.test(input.args?.command || "")) return;
    const result = await $`bash scripts/checks.sh`.cwd(directory).quiet();
    output.output = (output.output || "") + "\n\n--- checks informatifs post-outil ---\n" + result.stdout.toString();
  }
});
