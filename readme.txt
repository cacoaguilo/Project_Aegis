Project Aegis: An AI Futures Simulator
Logline

As Director of the Global AI Governance Council, your decisions will determine humanity's fate in the race to superintelligence. Will you lead us to a golden age, or an existential catastrophe?

Core Concept
Project Aegis is an interactive, text-based strategy game designed as an educational tool. It translates the complex concepts from the "Superintelligence Notes" document into an engaging, choice-driven narrative.

The player takes on the role of the first Director of the "Global AI Governance Council" in the year 2025. The core gameplay loop revolves around balancing four key metrics that represent the state of the world:
🚀 Innovation Rate: The speed of AI advancement.
🌍 Geopolitical Stability: The level of cooperation and trust between nations.
🛡️ Public Trust & Safety: The public's confidence in AI and their safety from misuse.
⚖️ Economic Equality: The distribution of wealth and opportunity in an automated world.

The game progresses in distinct phases. In each phase, the player is presented with a critical Policy Dilemma and a random Wildcard Event. The choices made directly impact the four key metrics, and the narrative adapts to reflect the consequences of those decisions. The game culminates in one of several distinct endings, each representing a possible future based on the player's governance style.

How to Play
Read the Scenario: Each phase begins with a narrative description of the current state of the world.
Make a Policy Choice: Analyze the pros and cons of the two options presented in the Policy Dilemma. The text is sourced directly from the provided research document. Click Select This Policy to make your choice.
React to Events: After your policy choice, a random "Wildcard Event" may occur, forcing you to make a crisis management decision.
Monitor Your Metrics: Keep a close eye on your four key metrics. Letting any one of them fall too low or rise too high can lead to unintended consequences.
Reach an Ending: After the final phase, your performance will be evaluated, and you will receive one of several possible endings, from a "Regulated Renaissance" to an "Uncontrolled Intelligence Explosion."

Code Description
The entire game is built as a single, self-contained HTML file. This design ensures maximum portability and ease of use—no build process or external dependencies (beyond Tailwind CSS and Google Fonts loaded from a CDN) are required.

The file is structured into three main parts:
HTML (<head> and <body>): Provides the fundamental structure of the game interface, including containers for the header, metrics display, main content, and the final ending modal. All interactive elements have unique IDs for manipulation via JavaScript.

CSS (<style> block):
Theming: Implements a retro, "CRT monitor" aesthetic using a green-on-black color scheme, monospace/orbitron fonts, and text-shadow effects to create an immersive atmosphere.

Layout: Uses Tailwind CSS for a responsive layout that works on both desktop and mobile devices.
Animations: Includes a subtle flicker and scanline animation to enhance the CRT effect, and smooth transitions for the metric bars.

JavaScript (<script> block): The core engine of the game.

DOMContentLoaded Listener: The entire script is wrapped in this listener to ensure the code only executes after the full HTML document is loaded, preventing race condition errors.

gameData Object: A constant object that acts as the "source of truth" for the game's content. It contains all the text for phases, dilemmas, choices, pros, cons, and the logic for the different endings. This makes the game content easy to read and modify.

gameState Object: A mutable copy of gameData that is created at the start of the game. This object holds the current values of the player's metrics and the current phase, allowing it to be changed without altering the original game data.

Core Functions:

renderMetrics(): Updates the UI to show the current percentage and color of the four metric bars.

renderPhase(): Populates the UI with the narration, dilemma, and choices for the current phase of the game.
handleDilemmaDecision() / handleWildcardDecision(): These functions are triggered by player clicks. They process the impact of a chosen option, call updateMetrics(), and advance the game to the next stage (either a wildcard event or the next phase).

triggerWildcard(): Randomly selects and displays a wildcard event from the current phase's pool.
endGame(): Evaluates the final metrics against the conditions defined in the gameData.endings array and displays the appropriate ending modal.

State Management: The game's state is managed simply by incrementing the currentPhase variable and updating the metrics values within the gameState object. Restoring the game is as simple as reloading the page.
Content Source

All narrative text, scenarios, pros, cons, and underlying concepts presented in this game are derived directly from the user-provided research document, "SuperIntelligence Notes.pdf." The game serves as an interactive medium to explore the critical insights and warnings contained within that document.
