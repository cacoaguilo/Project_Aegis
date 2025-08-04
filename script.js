document.addEventListener('DOMContentLoaded', function() {
    fetch('game-data.json')
        .then(response => response.json())
        .then(gameData => {
            // Convert condition strings back to functions
            gameData.endings.forEach(ending => {
                // Using eval is generally unsafe, but acceptable here since the source is a trusted, static JSON file within our own project.
                ending.condition = eval(ending.condition);
            });

            // The rest of the game logic is now inside this 'then' block
            // to ensure it only runs after the game data is loaded.

            // Deep copy of gameData to create a mutable gameState
            const gameState = JSON.parse(JSON.stringify(gameData));
            // Note: The deep copy above will strip the 'condition' functions again.
            // This is fine for gameState, but we MUST use the original 'gameData'
            // object when checking for endings. This resolves the bug mentioned
            // in the original file's FIX comment.

            function updateMetrics(impact) {
                for (const key in impact) {
                    if (gameState.metrics[key]) {
                        gameState.metrics[key].value += impact[key];
                        if (gameState.metrics[key].value > 100) gameState.metrics[key].value = 100;
                        if (gameState.metrics[key].value < 0) gameState.metrics[key].value = 0;
                    }
                }
                renderMetrics();
            }

            function renderMetrics() {
                const container = document.getElementById('metrics-display');
                if (!container) return;
                container.innerHTML = '';
                for (const key in gameState.metrics) {
                    const metric = gameState.metrics[key];
                    let barColor = 'bg-green-500';
                    if (metric.value < 50) barColor = 'bg-yellow-500';
                    if (metric.value < 25) barColor = 'bg-red-500';

                    container.innerHTML += `
                        <div class="p-2">
                            <div class="flex justify-between items-center text-xs mb-1">
                                <span>${metric.icon} ${metric.name}</span>
                                <span>${metric.value}%</span>
                            </div>
                            <div class="metric-bar-bg w-full h-2 rounded-full">
                                <div class="metric-bar-fg h-full rounded-full ${barColor}" style="width: ${metric.value}%;"></div>
                            </div>
                        </div>
                    `;
                }
            }

            function renderPhase(phaseIndex) {
                const phase = gameState.phases[phaseIndex];
                if (!phase) return;

                document.getElementById('phase-title').textContent = phase.title;
                document.getElementById('narration-text').textContent = phase.narration;

                const dilemma = phase.dilemma;
                const dilemmaTitleEl = document.getElementById('dilemma-title');
                const dilemmaDescEl = document.getElementById('dilemma-description');
                const choicesContainer = document.getElementById('choices-container');

                if (!dilemmaTitleEl || !dilemmaDescEl || !choicesContainer) return;

                dilemmaTitleEl.textContent = dilemma.title;
                dilemmaDescEl.textContent = dilemma.description;
                choicesContainer.innerHTML = '';

                dilemma.choices.forEach((choice, index) => {
                    choicesContainer.innerHTML += `
                        <div class="narration-box p-4 rounded">
                            <h4 class="title-font text-lg mb-2">${choice.text}</h4>
                            <p class="text-xs mb-2"><strong class="text-green-400">PROS:</strong> ${choice.pros}</p>
                            <p class="text-xs mb-4"><strong class="text-red-400">CONS:</strong> ${choice.cons}</p>
                            <button class="choice-button w-full py-2 rounded" data-choice-index="${index}" data-type="dilemma">Select This Policy</button>
                        </div>
                    `;
                });

                document.querySelectorAll('.choice-button[data-type="dilemma"]').forEach(button => {
                    button.addEventListener('click', handleDilemmaDecision);
                });
            }

            function handleDilemmaDecision(event) {
                const choiceIndex = event.target.dataset.choiceIndex;
                const phase = gameState.phases[gameState.currentPhase];
                const choice = phase.dilemma.choices[choiceIndex];

                updateMetrics(choice.impact);

                document.querySelectorAll('.choice-button[data-type="dilemma"]').forEach(b => b.disabled = true);

                setTimeout(() => {
                    if (phase.wildcardEvents && phase.wildcardEvents.length > 0) {
                        triggerWildcard();
                    } else {
                        // If there are no more phases, end the game.
                        if (gameState.currentPhase >= gameState.phases.length -1) {
                            endGame();
                        } else {
                             // This case shouldn't be hit with current game data, but is good practice.
                             gameState.currentPhase++;
                             renderPhase(gameState.currentPhase);
                        }
                    }
                }, 1500);
            }

            function triggerWildcard() {
                const phase = gameState.phases[gameState.currentPhase];
                const event = phase.wildcardEvents[Math.floor(Math.random() * phase.wildcardEvents.length)];

                const dilemmaBox = document.getElementById('dilemma-box');
                if (!dilemmaBox) return;

                dilemmaBox.innerHTML = `
                    <div class="event-box p-4 rounded animate-pulse">
                        <h3 class="title-font text-lg mb-2 text-yellow-400">${event.title}</h3>
                        <p class="mb-4 text-sm">${event.description}</p>
                        <div id="event-choices" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${event.choices.map((choice, index) => `
                                <button class="choice-button w-full py-2 rounded" data-choice-index="${index}" data-type="event">${choice.text}</button>
                            `).join('')}
                        </div>
                    </div>
                `;

                document.querySelectorAll('.choice-button[data-type="event"]').forEach(button => {
                    button.addEventListener('click', (e) => handleWildcardDecision(e, event));
                });
            }

            function handleWildcardDecision(e, eventData) {
                const choiceIndex = e.target.dataset.choiceIndex;
                const choice = eventData.choices[choiceIndex];

                updateMetrics(choice.impact);

                // Restore the dilemma box for the next phase
                const dilemmaBox = document.getElementById('dilemma-box');
                if(dilemmaBox) {
                    dilemmaBox.innerHTML = `
                        <h3 class="title-font text-lg mb-2" id="dilemma-title"></h3>
                        <p class="mb-4 text-sm" id="dilemma-description"></p>
                        <div id="choices-container" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
                    `;
                }

                gameState.currentPhase++;
                if (gameState.currentPhase < gameState.phases.length) {
                    setTimeout(() => renderPhase(gameState.currentPhase), 500);
                } else {
                    endGame();
                }
            }

            function endGame() {
                const finalMetrics = gameState.metrics;
                // Use the original gameData.endings which retains the functions
                let ending = gameData.endings.find(e => e.condition(finalMetrics));

                const endingTitleEl = document.getElementById('ending-title');
                const endingNarrativeEl = document.getElementById('ending-narrative');
                const endingModalEl = document.getElementById('ending-modal');

                if(endingTitleEl) endingTitleEl.textContent = ending.title;
                if(endingNarrativeEl) endingNarrativeEl.textContent = ending.narrative;
                if(endingModalEl) endingModalEl.classList.remove('hidden');
            }

            const restartButton = document.getElementById('restart-button');
            if(restartButton) {
                restartButton.addEventListener('click', () => {
                    window.location.reload();
                });
            }

            // Initial game setup
            renderMetrics();
            renderPhase(gameState.currentPhase);
        })
        .catch(error => {
            console.error("Error loading game data:", error);
            // You could display a user-friendly error message here
        });
});
