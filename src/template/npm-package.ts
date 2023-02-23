import { PortAnswers } from "../index.js";

export default function ({
  portName,
  portNameKebabCase,
  authorName,
  authorEmail,
}: PortAnswers) {
  return {
    name: `@catppuccin/${portNameKebabCase}`,
    version: "0.1.0",
    description: `Soothing pastel theme for ${portName}`,
    license: "MIT",
    repository: `github:catppuccin/${portNameKebabCase}`,
    keywords: ["catppuccin"],
    author: "Catppuccin Org <releases@catppuccin.com>",
    contributors: [`${authorName}${authorEmail ? ` <${authorEmail}>` : ""}`],
    bugs: {
      url: `https://github.com/catppuccin/${portNameKebabCase}/issues`,
      email: "releases@catppuccin.com",
    },
    funding: [
      {
        type: "opencollective",
        url: "https://opencollective.com/catppuccin",
      },
      {
        type: "github",
        url: "https://github.com/sponsors/catppuccin",
      },
    ],
    homepage: `https://github.com/catppuccin/${portNameKebabCase}#readme`,
  };
}
