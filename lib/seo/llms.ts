import type { SeoConfig } from "@/lib/seo/types";

export function buildLlmsTxt(config: SeoConfig): string {
  if (!config.llms) return "";
  const baseUrl = config.siteUrl.replace(/\/+$/, "");
  const lines: string[] = [
    `# ${config.llms.title}`,
    "",
    `> ${config.llms.summary}`,
    "",
  ];

  for (const section of config.llms.sections) {
    lines.push(`## ${section.heading}`, "");
    for (const item of section.items) {
      const normalizedPath = item.path.startsWith("/")
        ? item.path
        : `/${item.path}`;
      const url = `${baseUrl}${normalizedPath}`;
      lines.push(
        `- [${item.title}](${url})${item.note ? `: ${item.note}` : ""}`
      );
    }
    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}

