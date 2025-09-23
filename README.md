# Hey Spex

**A better way to code with AI**

Stop vibe coding. Start building from specs.

Hey Spex is a lightweight spec-driven development layer for solo devs and indie makers. Built on top of GitHub's SpecKit, Hey Spex keeps your specs, context, and guardrails in sync so AI builds what you mean, NOT what it guesses.

## The Problem

AI is great at patterns, terrible at reading your mind. Vague prompts lead to fragile code, misaligned features, and endless debugging sessions. When you "vibe code" with AI, you're essentially asking it to guess what you want to build. IDEs like Cursor are not planning tools. They are for implementation. HeySpex handles planning outside of your IDE environment and then creates a feedback loop for iterative cycles. The truth is, development is messy. HeySpex allows the messy to happen and organizes it for us and helps us enhance our implementation as we go - with the perfect context that each task needs.

## The Solution

**Spec-driven development** changes everything. Instead of hoping AI understands your intent, you define it clearly through living specifications that guide every decision.

![HeySpex Flowchart](/media/heyspex-flowchart.png)


## Built For

- **Solo developers** who want clarity, not clutter
- **Indie makers** who ship with AI but need control
- **Teams** who want clean code, not guesses
- **Anyone** tired of AI building the wrong thing
  
### Four Clear Phases

1. **Specify** → Define intent, outcomes, and user journeys
2. **Plan** → Set architecture, constraints, and technical requirements  
3. **Tasks** → Break down into safe, testable units
4. **Implement** → AI executes incrementally with validation at every step

## Features Overview

### 🎯 Spec-First, Not Guess-First
Write intent, outcomes, and flows before code. Hey Spex turns it into a living spec the AI can actually follow.

### 🛡️ Guardrails, Not Chaos
Catch fragile code, missing tests, and unsafe changes before they hit your repo.

### 🧠 Context That Sticks
Keep your specs, prompts, errors, and notes in sync. You'll never lose track of what the AI was supposed to build.

### 🔄 Build Momentum with Loops
Forget thrash. Loops keep you focused on steady progress with light weekly cycles around specs.

### 🗺️ Direction Without Overhead
Sketch what's next in Roadmaps. Hey Spex ties your specs, flows, and issues together so you can keep shipping.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Spec Engine**: Built on [GitHub's SpecKit](https://github.com/github/speckit)

## Roadmap

### In Progress

- Build UI

### Haven't Started
- Connect Convex Database
- Connect Firebase Auth
- Connect Vercel
- Github Integration
- Create local MCP, connect to Cursor
- Create "staged tasks" workflow
- Create Docs V1
- Google SpecKit Integration

## Features

### UI

- Inspired by Linear.app, Spotify, Railway,
- Each section is fully configurable - you can load any screen or tool into any section, resize them, expand/collapse them, and create custom views. This gives you the flexibility to arrange your workspace exactly how you need it.


## Quick Start

### Installation

```shell
git clone https://github.com/pwhermanson/heyspex.git
cd heyspex
```

### Install dependencies

```shell
pnpm install
```

### Start the development server

```shell
pnpm dev
```

## Philosophy

**Build what you mean, not what the AI guessed.**

Hey Spex treats AI coding agents like teammates with transparency and reproducibility. No more lost context, no more fragile code, no more surprises.

---

*Hey Spex. Spec-driven development for solo devs.*
