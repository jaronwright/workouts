# Prompt, Context, and Harness Engineering: The Evolution

Something interesting is happening in the way people talk about working with AI, and I think it reveals a deeper pattern worth paying attention to.

In 2024, everyone was obsessed with prompt engineering. In 2025, the conversation shifted to context engineering. And now in 2026, the people building the most impressive things have moved on again, to something called harness engineering. Each shift happened faster than the last, and each one made the previous skill feel like table stakes rather than a superpower.

I want to walk through how we got here, why it matters, and what it actually looks like in practice. Because I think most people are still operating in the 2024 paradigm, and the gap between that and what is possible today is enormous.

## The prompt engineering years

Think back to 2024. The hottest skill in tech was figuring out how to phrase your requests to an AI just right. There were prompt libraries, prompt marketplaces, and bootcamps charging thousands of dollars to teach you the art of the perfect instruction. LinkedIn profiles everywhere suddenly featured the title Prompt Engineer.

And the thing is, it genuinely worked. Telling a model to think step by step or to act as a senior architect produced measurably better results than a naive request. Few-shot prompting, chain-of-thought reasoning, role-based instructions. These were real techniques that made a real difference.

But prompt engineering had a ceiling, and by late 2024 most serious practitioners were bumping against it.

The fundamental issue was this. A prompt is a single instruction, but real work requires an entire environment. If you ask an AI to write a React component for user authentication, you get generic boilerplate. The model does not know that your project uses TanStack Query for server state. It does not know your team chose Zustand over Redux. It does not know that your API returns profiles with a specific field that every mock object needs to include. It does not know any of the thousand small decisions that make code actually fit into a living codebase.

Prompt engineering turned out to be the art of asking a brilliant question in a vacuum. And real work does not happen in a vacuum.

## The shift to context

On June 19, 2025, Shopify CEO Tobi Lutke posted something on X that crystallized what many developers were already feeling. He said he preferred the term context engineering over prompt engineering because it described the core skill better. Andrej Karpathy immediately agreed, calling it the delicate art and science of filling the context window with just the right information for the next step.

The term spread fast because it named something people already knew was true. The quality of what an AI produces depends less on how you phrase your request and more on what information surrounds that request.

This was a genuine paradigm shift. Instead of crafting a perfect 50 word prompt, you were now curating a 50,000 token environment. What files does the model need to see? What architectural decisions should it know about? What examples of correct output can you provide? What constraints need to be explicit rather than assumed?

Anthropic published a guide on what they called effective context engineering for AI agents, and it reframed the whole discipline. Context engineering, they argued, is the set of strategies for curating and maintaining the optimal set of tokens during inference. Not prompt words. Context tokens. The distinction matters more than it sounds like it should.

The data supported the shift. LangChain found in their 2025 State of Agent Engineering report that 57 percent of organizations had AI agents in production, but 32 percent cited quality as their top barrier. And most of those quality failures traced back not to the model being incapable, but to the model receiving the wrong context. Organizations that invested in robust context architectures saw 50 percent improvements in response times and 40 percent higher quality outputs.

Tools evolved to match. CLAUDE.md files became standard practice, acting as persistent project memory that loads automatically and gives AI the architectural context and conventions it needs before you type a single character. MCP, the Model Context Protocol, emerged as a universal standard for letting agents plug into databases, APIs, issue trackers, and communication tools to pull in relevant context on the fly.

Context engineering was the right idea. But by late 2025, the people pushing the frontier were discovering it still was not quite enough.

You could feed a model perfect context for a single interaction. But what about a seven hour autonomous coding session across a codebase with millions of lines? What about sixteen agents working in parallel? What about tasks that span multiple context windows, require coordination between specialized workers, and need to recover gracefully when something goes wrong?

Context engineering answered the question of what the model should see. It did not answer the question of what system should surround the model to make it reliably autonomous.

## Enter harness engineering

In early 2026, Anthropic published a blog post called Effective Harnesses for Long-Running Agents. It did not get the attention it deserved, but I think it will be looked back on as one of the more important pieces written about AI engineering this year.

The architecture they described was deceptively simple. An initializer agent sets up the environment by cloning repos, running setup scripts, and building a structured feature list and progress log. Then it hands off to a coding agent that works incrementally, implementing one feature per session, running end to end tests, committing clean code, and updating its progress file before moving to the next thing.

The key insight was this. External artifacts become the agent's memory. Progress files, git history, structured feature lists. These things persist across context windows, across sessions, across agent restarts. The agent does not need to remember everything because the harness remembers for it.

Phil Schmid offered an analogy that made this click for me. Think of the model as a CPU. The context window is RAM. The agent harness is the operating system. And the agent itself is an application running on top of all that.

We are not just writing prompts anymore. We are not just curating context. We are building operating systems for AI.

An agent harness is the infrastructure layer that wraps around a model to manage long running tasks. It handles initialization, tool orchestration, lifecycle events, error recovery, memory that persists beyond any single session, security boundaries, and coordination between multiple agents. It sits above any individual framework and provides the scaffolding that turns a capable but forgetful model into a reliable system.

The market has noticed. Aakash Gupta pointed out that the competitive advantage in 2026 is coming from infrastructure, not intelligence. Manus went through five rewrites over six months building their harness. LangChain spent a year iterating through four different architectures. You can fine tune a competitive model in weeks. Building a production ready harness takes months or years.

The moat is no longer the model. The moat is the harness.

## What this looks like in practice

If you want to see harness engineering made tangible, Claude Code is the clearest example. It started as a CLI coding tool in February 2025 and has since evolved into what is probably the most sophisticated agent harness in production, reaching a billion dollars in annualized revenue faster than ChatGPT did.

The important thing to understand about Claude Code is that it is not a chatbot that writes code. It is an orchestration system built around an agentic loop. Gather context. Take action. Verify the results. Iterate until done. And that loop is wrapped in layers of infrastructure that make autonomous operation actually reliable.

Let me walk through what those layers look like, because I think it makes the abstract concept of harness engineering very concrete.

**The execution layer** gives the model real tools. Not just code generation, but file operations, terminal access, search, browser automation, and critically the ability to verify its own work by running tests and builds and linters. This creates a closed feedback loop. The agent writes code, runs the tests, sees what fails, and fixes it. That is fundamentally different from generating code and hoping it works.

**The memory layer** is where things get interesting. A CLAUDE.md file provides project memory, loading your architecture and conventions and hard won lessons automatically at the start of every session. It is the difference between onboarding a new hire and working with someone who has been on your project for six months. Beyond that, Claude Code has an auto-memory system that writes down patterns it discovers, mistakes it learns from, and decisions that were made, then consults those notes in future sessions. Checkpoints capture the complete state before every edit so you can roll back to any point. And sessions persist to disk so you can resume days later with full context intact.

**The context management layer** is where context engineering gets operationalized inside the harness. A compact command compresses conversation history while preserving critical information, cutting token usage roughly in half and letting sessions run much longer. Progressive disclosure means the system loads information as needed rather than dumping everything in at once. Modular rules let you set different conventions for different parts of your codebase. And MCP integration connects the agent to your actual systems, pulling real time data from databases and issue trackers and monitoring tools.

**The security layer** is what makes real autonomy possible. In November 2025, Anthropic added OS level sandboxing using platform native primitives like Linux bubblewrap and macOS seatbelt. This enforces filesystem and network isolation at the operating system level. Even if a prompt injection somehow compromises the model's output, the sandbox prevents it from accessing SSH keys or making unauthorized network connections or touching sensitive files outside the project. Internally at Anthropic, this reduced permission prompts by 84 percent while actually increasing security. On top of that, granular permissions let you define exactly which directories, commands, and tools the agent can access. And hooks fire at lifecycle events like before and after tool use, letting you intercept and modify agent behavior programmatically. You can auto-format code after every edit, block dangerous git operations, or validate inputs before they reach the model.

**The orchestration layer** is the current frontier. Claude Code can delegate work to specialized subagents, each running in its own context window so the main conversation stays clean. An Explore agent handles codebase research. A Plan agent designs architecture. A Bash agent runs commands. The main agent coordinates while the subagents execute.

With the release of Opus 4.6 in February 2026, this expanded into full Agent Teams. Multiple Claude Code instances now work in parallel on different aspects of a project. One agent builds the frontend while another implements the API layer while a third handles database migrations. They coordinate autonomously. Anthropic stress tested this by having 16 agents build a C compiler from scratch.

Background agents let you fire off a long running task and keep working on something else while it completes. Claude Code on the Web moves execution to isolated cloud sandboxes so you can kick off multiple coding tasks asynchronously without even opening a terminal.

And the whole thing is extensible. Skills provide reusable task handlers that can trigger automatically or manually. A plugin marketplace with over 87 community contributions extends what the harness can do. The Claude Agent SDK exposes the entire harness programmatically in TypeScript and Python so you can build custom agents that inherit all this infrastructure.

This is what a mature agent harness looks like. Not a clever prompt. Not even a carefully curated context window. An entire operating system for AI powered work.

## Why this matters right now

Anthropic's 2026 Agentic Coding Trends Report documents the shift that is already underway. Engineering teams are moving from writing code to coordinating AI agents. AI shows up in roughly 60 percent of work, but engineers report being able to fully delegate only somewhere between 0 and 20 percent of their tasks. That gap between AI being involved and AI handling things autonomously is the harness gap. It is exactly the problem that harness engineering solves.

The real world results are striking. Rakuten used Claude Code to complete a task across a 12.5 million line codebase in seven hours of autonomous work with 99.9 percent numerical accuracy. TELUS shipped 13,000 custom AI solutions and saved 500,000 hours in aggregate. These are not demo numbers. They are production numbers that became possible because the harness made the agent reliable enough to trust.

The autonomous AI agent market is projected to reach 8.5 billion dollars in 2026, with 40 percent of enterprise applications working with AI agents by year end, up from under 5 percent in 2025.

But here is what I think is the most important thing to internalize. SemiAnalysis made a compelling case that Claude Code is not really a coding tool at all. It is a general purpose agent that happens to use code as its primary medium for accomplishing tasks. If that framing is correct, and I increasingly think it is, then harness engineering is not just a skill for AI specialists. It is becoming a core competency for anyone who builds software.

## Getting started

The good news is that you do not need to build a harness from scratch. The infrastructure already exists. The skill is learning to configure it, extend it, and think in terms of orchestration rather than individual interactions.

The highest leverage thing you can do today is write a good CLAUDE.md file for your project. Document your architecture, your conventions, your key decisions, and the gotchas you have learned the hard way. Be specific. Instead of writing that you use React, write that you use React 19 with TypeScript, TanStack Query for server state, Zustand for client state, and TailwindCSS 4 for styling, with a path alias that maps to your source directory. Every token should earn its place.

From there, connect MCP servers to the systems your work actually touches. Your database. Your issue tracker. Your monitoring. Your docs. Each connection gives the agent real time context that no static file can provide.

Then start thinking about lifecycle hooks. Set up hooks that auto-format code after edits, block dangerous operations before they happen, or initialize your environment at session start. This is the operating system driver layer, the invisible automation that makes every session more reliable without you thinking about it.

Design your permission boundaries deliberately. Be generous within safe limits. The whole point of sandboxing is that you can give the agent more freedom because the boundaries are enforced at the OS level rather than through constant permission prompts.

And most importantly, start thinking in orchestration patterns. Instead of asking yourself what prompt to write, ask what agents you should coordinate, what context each one needs, and how they should share their results. For a feature implementation you might have one agent planning the architecture, another implementing the backend, a third building the frontend, and a fourth writing tests. Each operates in its own context window with its own relevant slice of information. The harness coordinates all of it.

The most advanced pattern I have seen is building external memory systems. Structured progress files, feature checklists, and decision logs that persist across sessions. When an agent picks up tomorrow where it left off today, it reads the progress log rather than trying to reconstruct understanding from a compressed conversation. This is how Anthropic's own initializer plus coder architecture achieves multi-session reliability.

## The pattern underneath the pattern

Here is what I keep coming back to. Each of these paradigm shifts followed the same arc. What felt like mastery in the old paradigm became table stakes in the new one.

Prompt engineering did not disappear. It became a small component of context engineering. You still need clear instructions. But clear instructions inside rich context produce dramatically better results than a perfect prompt sitting alone.

Context engineering did not disappear either. It became a component of harness engineering. You still need the right information in the context window. But curated context inside a well designed harness with memory and tools and security and orchestration is a different thing entirely from curated context in a single shot interaction.

The progression is additive. Each layer builds on the one before it.

And the pace is accelerating. Prompt engineering dominated the conversation for roughly two years. Context engineering held the spotlight for barely one. Harness engineering is already the frontier, and whatever comes next is probably less than a year away.

I think the people who will do best are not the ones who master any single paradigm. They will be the ones who notice the pattern itself. The value keeps moving up the stack, from individual words to curated information to full systems. And the move is always in the same direction: toward more infrastructure, more orchestration, more of the work being done by the system around the model rather than by any single interaction with it.

The model is the engine. The context is the fuel. The harness is the vehicle.

It is time to start building vehicles.

---

*I write about AI tooling and software engineering. If this was useful, follow along. I am building in public with Claude Code and sharing what I learn as I go.*
