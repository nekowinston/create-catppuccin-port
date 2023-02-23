#!/usr/bin/env node

// Usage: npx create-catppuccin-port <name>

const ui = new inquirer.ui.BottomBar();
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import inquirer from "inquirer";
import npmPackage from "./template/npm-package.js";
import { execSync } from "child_process";

const name = process.argv[2];
const currentDir = process.cwd();
const projectDir = path.join(currentDir, name);

const templateRepo = "https://github.com/catppuccin/template/raw/main/";
const healthFiles = [".editorconfig", "LICENSE"];

if (!name) {
  console.error("Please specify a name for the theme");
  process.exit(1);
}
if (fs.existsSync(projectDir)) {
  console.error("A folder with that name already exists");
  process.exit(1);
}

export type PortAnswers = {
  portName: string;
  portNameKebabCase: string;
  portWebsite: string;
  license: string;
  releaseRequired: boolean;
  releaseMethod?: string;
  authorName: string;
  authorEmail?: string;
};

const toKebabCase = (str: string) =>
  str.toLowerCase().replace(" ", "-").replace("_", "-");

inquirer
  .prompt([
    {
      name: "portName",
      message: "What is the name of software you're creating a theme for?",
    },
    {
      name: "portWebsite",
      message:
        "What's the software's website? (GitHub repo is preferred when FOSS)",
      type: "input",
      validate: (input: string) => {
        if (!input.match(/https?:\/\//) && input.match(/\w+\.\w+/)) {
          input = "https://" + input;
        }
        try {
          new URL(input);
          return true;
        } catch (err) {
          return false;
        }
      },
    },
    {
      name: "releaseRequired",
      message:
        "Do you need to make a release on platforms other than GitHub? (e.g. NPM, Cargo, Marketplaces)",
      type: "confirm",
      default: false,
    },
    {
      name: "releaseMethod",
      message: "What is the release method?",
      type: "list",
      choices: [
        "NPM",
        "Cargo",
        "Marketplace (like VSCode, JetBrains, etc.)",
        "Other",
      ],
      when: (answers) => answers.releaseRequired,
    },
    {
      name: "authorName",
      message: "What is your name?",
      default: () => {
        // get the name from git config, fall back to the current user
        try {
          return execSync("git config --get user.name").toString().trim();
        } catch (err) {
          return;
        }
      },
    },
    {
      name: "authorEmail",
      message: "What is your email? (optional, for credits)",
      default: () => {
        // get the email from git config, fall back to empty
        try {
          return execSync("git config --get user.email").toString().trim();
        } catch (err) {
          return;
        }
      },
      when: (answers) => answers.releaseRequired,
    },
  ])
  .then((answers) => {
    fs.mkdirSync(projectDir);

    answers.portNameKebabCase = toKebabCase(answers.portName);

    switch (answers.releaseMethod) {
      case "NPM":
        fs.writeFileSync(
          path.join(projectDir, "package.json"),
          JSON.stringify(npmPackage(answers), null, 2)
        );
        break;
      case undefined:
        break;
      default:
        ui.log.write("Unsupported release method");
        break;
    }

    axios
      .get("https://github.com/catppuccin/template/raw/main/README.md")
      .then((res) => {
        let text = res.data as string;
        text = text.replace(/template/g, answers.portNameKebabCase);
        text = text.replace("App", answers.portName);
        text = text.replace(
          new RegExp(
            "https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/previews",
            "g"
          ),
          "assets"
        );
        text = text.replace("Human", answers.authorName);

        fs.writeFileSync(path.join(projectDir, "README.md"), text);
      });

    healthFiles.map((file) => {
      axios.get(templateRepo + file).then((res) => {
        fs.writeFileSync(path.join(projectDir, file), res.data);
      });
    });
    fs.mkdirSync(path.join(projectDir, "assets"));
    fs.writeFileSync(path.join(projectDir, "assets", ".gitkeep"), "");

    // try to initialize a git repo, I don't care if it fails
    try {
      execSync("git init", { cwd: projectDir });
    } catch (e) {}
  });
