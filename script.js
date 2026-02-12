// Default card sets - empty to start
const defaultCardSets = {};

// LocalStorage management
const STORAGE_KEY = 'studyCardSets';
const STARRED_KEY = 'studyCardStarred';

function loadCardSets() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing stored card sets:', e);
            return { ...defaultCardSets };
        }
    } else {
        // First time - save default sets to localStorage
        saveCardSets(defaultCardSets);
        return { ...defaultCardSets };
    }
}

function saveCardSets(sets) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
}

function loadStarredCards() {
    const stored = localStorage.getItem(STARRED_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing starred cards:', e);
            return {};
        }
    }
    return {};
}

function saveStarredCards(starred) {
    localStorage.setItem(STARRED_KEY, JSON.stringify(starred));
}

function getCardKey(setName, cardIndex) {
    return `${setName}:${cardIndex}`;
}

function isCardStarred(setName, cardIndex) {
    const starred = loadStarredCards();
    return starred[getCardKey(setName, cardIndex)] === true;
}

function toggleCardStar(setName, cardIndex) {
    const starred = loadStarredCards();
    const key = getCardKey(setName, cardIndex);
    if (starred[key]) {
        delete starred[key];
    } else {
        starred[key] = true;
    }
    saveStarredCards(starred);
    return starred[key] === true;
}

function addCardSet(setName, cards) {
    const sets = loadCardSets();
    sets[setName] = cards;
    saveCardSets(sets);
    return sets;
}

function deleteCardSet(setName) {
    const sets = loadCardSets();
    delete sets[setName];
    saveCardSets(sets);
    return sets;
}

// Initialize card sets from localStorage
let cardSets = loadCardSets();

let currentSetName = Object.keys(cardSets).length > 0 ? Object.keys(cardSets)[0] : null;
let cards = currentSetName ? [...cardSets[currentSetName]] : [];
let currentIndex = 0;

const card = document.getElementById('card');
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const currentEl = document.getElementById('current');
const totalEl = document.getElementById('total');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const setSelector = document.getElementById('set-selector');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');
const setsContainer = document.getElementById('sets-container');
const pasteBtn = document.getElementById('paste-btn');
const pasteModal = document.getElementById('paste-modal');
const jsonInput = document.getElementById('json-input');
const importBtn = document.getElementById('import-btn');
const cancelBtn = document.getElementById('cancel-btn');
const manageBtn = document.getElementById('manage-btn');
const manageModal = document.getElementById('manage-modal');
const closeModal = document.getElementById('close-modal');
const exportBtn = document.getElementById('export-btn');
const addCardBtn = document.getElementById('add-card-btn');
const deleteCardBtn = document.getElementById('delete-card-btn');
const addCardModal = document.getElementById('add-card-modal');
const cancelAddCard = document.getElementById('cancel-add-card');
const saveCardBtn = document.getElementById('save-card-btn');
const newQuestionInput = document.getElementById('new-question');
const newAnswerInput = document.getElementById('new-answer');
const exportModal = document.getElementById('export-modal');
const closeExportModal = document.getElementById('close-export-modal');
const exportOutput = document.getElementById('export-output');
const saveExportBtn = document.getElementById('save-export-btn');
const starBtn = document.getElementById('star-btn');
const shuffleModal = document.getElementById('shuffle-modal');
const closeShuffleModal = document.getElementById('close-shuffle-modal');
const shuffleAllBtn = document.getElementById('shuffle-all-btn');
const shuffleStarredBtn = document.getElementById('shuffle-starred-btn');

function displayCard() {
    if (cards.length === 0 || !currentSetName) {
        questionEl.textContent = 'No card sets available';
        answerEl.textContent = 'Upload a JSON file to get started';
        totalEl.textContent = '0';
        currentEl.textContent = '0';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        addCardBtn.disabled = !currentSetName;
        deleteCardBtn.disabled = true;
        starBtn.style.display = 'none';
        return;
    }

    const currentCard = cards[currentIndex];
    questionEl.textContent = currentCard.question;
    answerEl.textContent = currentCard.answer;
    currentEl.textContent = currentIndex + 1;
    totalEl.textContent = cards.length;

    // Reset flip state
    card.classList.remove('flipped');

    // Update button states
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === cards.length - 1;
    addCardBtn.disabled = false;
    deleteCardBtn.disabled = false;
    starBtn.style.display = 'block';

    // Update star button
    updateStarButton();
}

function updateStarButton() {
    if (!currentSetName || cards.length === 0) return;

    // Find the original index of the current card in the cardSets
    const originalIndex = cardSets[currentSetName].findIndex(
        card => card.question === cards[currentIndex].question &&
                card.answer === cards[currentIndex].answer
    );

    if (originalIndex !== -1 && isCardStarred(currentSetName, originalIndex)) {
        starBtn.textContent = '★';
        starBtn.classList.add('starred');
    } else {
        starBtn.textContent = '☆';
        starBtn.classList.remove('starred');
    }
}

function flipCard() {
    card.classList.toggle('flipped');
}

function nextCard() {
    if (currentIndex < cards.length - 1) {
        currentIndex++;
        displayCard();
    }
}

function prevCard() {
    if (currentIndex > 0) {
        currentIndex--;
        displayCard();
    }
}

function handleStarToggle() {
    if (!currentSetName || cards.length === 0) return;

    // Find the original index of the current card in the cardSets
    const originalIndex = cardSets[currentSetName].findIndex(
        card => card.question === cards[currentIndex].question &&
                card.answer === cards[currentIndex].answer
    );

    if (originalIndex !== -1) {
        toggleCardStar(currentSetName, originalIndex);
        updateStarButton();
    }
}

function shuffleCards(starredOnly = false) {
    let cardsToShuffle;

    if (starredOnly) {
        // Filter for starred cards only
        cardsToShuffle = cardSets[currentSetName].filter((card, index) =>
            isCardStarred(currentSetName, index)
        );

        if (cardsToShuffle.length === 0) {
            alert('No starred cards in this set.');
            return;
        }
    } else {
        cardsToShuffle = [...cardSets[currentSetName]];
    }

    // Shuffle the array
    for (let i = cardsToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardsToShuffle[i], cardsToShuffle[j]] = [cardsToShuffle[j], cardsToShuffle[i]];
    }

    cards = cardsToShuffle;
    currentIndex = 0;
    displayCard();
}

function changeSet(setName) {
    currentSetName = setName;
    cards = [...cardSets[setName]];
    currentIndex = 0;
    displayCard();
}

function populateSetSelector() {
    setSelector.innerHTML = '';

    if (Object.keys(cardSets).length === 0) {
        const option = document.createElement('option');
        option.textContent = 'No card sets - upload one to start';
        option.disabled = true;
        setSelector.appendChild(option);
        return;
    }

    Object.keys(cardSets).forEach(setName => {
        const option = document.createElement('option');
        option.value = setName;
        option.textContent = setName;
        setSelector.appendChild(option);
    });
    setSelector.value = currentSetName;
}

function renderSetsList() {
    setsContainer.innerHTML = '';

    if (Object.keys(cardSets).length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No card sets yet. Upload a JSON file to get started!';
        emptyMessage.style.color = '#666';
        emptyMessage.style.fontStyle = 'italic';
        setsContainer.appendChild(emptyMessage);
        return;
    }

    Object.keys(cardSets).forEach(setName => {
        const setItem = document.createElement('div');
        setItem.className = 'set-item';

        const setInfo = document.createElement('span');
        setInfo.textContent = `${setName} (${cardSets[setName].length} cards)`;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => handleDeleteSet(setName);

        setItem.appendChild(setInfo);
        setItem.appendChild(deleteBtn);
        setsContainer.appendChild(setItem);
    });
}

function handleDeleteSet(setName) {
    if (confirm(`Are you sure you want to delete "${setName}"?`)) {
        cardSets = deleteCardSet(setName);

        // If deleted set was current, switch to first available set or reset
        if (currentSetName === setName) {
            if (Object.keys(cardSets).length > 0) {
                currentSetName = Object.keys(cardSets)[0];
                cards = [...cardSets[currentSetName]];
            } else {
                currentSetName = null;
                cards = [];
            }
            currentIndex = 0;
            displayCard();
        }

        populateSetSelector();
        renderSetsList();
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const uploadedData = JSON.parse(e.target.result);

            // Validate the uploaded JSON structure
            if (typeof uploadedData !== 'object' || uploadedData === null) {
                throw new Error('Invalid JSON format. Expected an object.');
            }

            // Process each set in the uploaded JSON
            let addedSets = 0;
            for (const [setName, setCards] of Object.entries(uploadedData)) {
                if (!Array.isArray(setCards)) {
                    console.warn(`Skipping "${setName}": cards must be an array`);
                    continue;
                }

                // Validate card structure
                const validCards = setCards.filter(card =>
                    card &&
                    typeof card === 'object' &&
                    'question' in card &&
                    'answer' in card
                );

                if (validCards.length === 0) {
                    console.warn(`Skipping "${setName}": no valid cards found`);
                    continue;
                }

                cardSets = addCardSet(setName, validCards);
                addedSets++;
            }

            if (addedSets === 0) {
                alert('No valid card sets found in the uploaded file.');
            } else {
                alert(`Successfully added ${addedSets} card set(s)!`);

                // If this is the first set(s), initialize the current set
                if (!currentSetName && Object.keys(cardSets).length > 0) {
                    currentSetName = Object.keys(cardSets)[0];
                    cards = [...cardSets[currentSetName]];
                    currentIndex = 0;
                }

                populateSetSelector();
                renderSetsList();
                displayCard();
            }
        } catch (error) {
            alert(`Error reading file: ${error.message}`);
        }

        // Reset file input
        fileInput.value = '';
    };

    reader.readAsText(file);
}

function handlePasteImport() {
    const jsonText = jsonInput.value.trim();
    if (!jsonText) {
        alert('Please paste some JSON first.');
        return;
    }

    try {
        const uploadedData = JSON.parse(jsonText);

        // Validate the uploaded JSON structure
        if (typeof uploadedData !== 'object' || uploadedData === null) {
            throw new Error('Invalid JSON format. Expected an object.');
        }

        // Process each set in the uploaded JSON
        let addedSets = 0;
        for (const [setName, setCards] of Object.entries(uploadedData)) {
            if (!Array.isArray(setCards)) {
                console.warn(`Skipping "${setName}": cards must be an array`);
                continue;
            }

            // Validate card structure
            const validCards = setCards.filter(card =>
                card &&
                typeof card === 'object' &&
                'question' in card &&
                'answer' in card
            );

            if (validCards.length === 0) {
                console.warn(`Skipping "${setName}": no valid cards found`);
                continue;
            }

            cardSets = addCardSet(setName, validCards);
            addedSets++;
        }

        if (addedSets === 0) {
            alert('No valid card sets found in the pasted JSON.');
        } else {
            alert(`Successfully added ${addedSets} card set(s)!`);

            // If this is the first set(s), initialize the current set
            if (!currentSetName && Object.keys(cardSets).length > 0) {
                currentSetName = Object.keys(cardSets)[0];
                cards = [...cardSets[currentSetName]];
                currentIndex = 0;
            }

            populateSetSelector();
            renderSetsList();
            displayCard();

            // Close modal and clear input
            pasteModal.classList.remove('active');
            jsonInput.value = '';
        }
    } catch (error) {
        alert(`Error parsing JSON: ${error.message}`);
    }
}

function handleAddCard() {
    const question = newQuestionInput.value.trim();
    const answer = newAnswerInput.value.trim();

    if (!question || !answer) {
        alert('Please enter both a question and an answer.');
        return;
    }

    if (!currentSetName) {
        alert('No set selected. Please create or select a set first.');
        return;
    }

    // Add the new card to the current set
    const newCard = { question, answer };
    cardSets[currentSetName].push(newCard);
    saveCardSets(cardSets);

    // Update the current cards array
    cards.push(newCard);

    // Close modal and clear inputs
    addCardModal.classList.remove('active');
    newQuestionInput.value = '';
    newAnswerInput.value = '';

    // Update display
    renderSetsList();
    displayCard();

    alert('Card added successfully!');
}

function handleDeleteCard() {
    if (!currentSetName || cards.length === 0) {
        return;
    }

    if (!confirm('Are you sure you want to delete this card?')) {
        return;
    }

    // Remove the card from the set
    cardSets[currentSetName].splice(currentIndex, 1);
    saveCardSets(cardSets);

    // Update the current cards array
    cards.splice(currentIndex, 1);

    // Adjust current index if needed
    if (currentIndex >= cards.length && cards.length > 0) {
        currentIndex = cards.length - 1;
    } else if (cards.length === 0) {
        currentIndex = 0;
    }

    // Update display
    renderSetsList();
    displayCard();
}

function handleExport() {
    if (Object.keys(cardSets).length === 0) {
        alert('No card sets to export.');
        return;
    }

    // Convert all card sets to JSON string
    const jsonString = JSON.stringify(cardSets, null, 2);

    // Display in text box
    exportOutput.value = jsonString;

    // Show export modal
    exportModal.classList.add('active');
}

function handleSaveExport() {
    const jsonString = exportOutput.value;

    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study_cards_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Event listeners
card.addEventListener('click', flipCard);
nextBtn.addEventListener('click', nextCard);
prevBtn.addEventListener('click', prevCard);
shuffleBtn.addEventListener('click', () => {
    shuffleModal.classList.add('active');
});
setSelector.addEventListener('change', (e) => changeSet(e.target.value));
starBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleStarToggle();
});
closeShuffleModal.addEventListener('click', () => {
    shuffleModal.classList.remove('active');
});
shuffleAllBtn.addEventListener('click', () => {
    shuffleModal.classList.remove('active');
    shuffleCards(false);
});
shuffleStarredBtn.addEventListener('click', () => {
    shuffleModal.classList.remove('active');
    shuffleCards(true);
});
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileUpload);
pasteBtn.addEventListener('click', () => {
    pasteModal.classList.add('active');
    jsonInput.focus();
});
cancelBtn.addEventListener('click', () => {
    pasteModal.classList.remove('active');
    jsonInput.value = '';
});
importBtn.addEventListener('click', handlePasteImport);
manageBtn.addEventListener('click', () => {
    manageModal.classList.add('active');
});
closeModal.addEventListener('click', () => {
    manageModal.classList.remove('active');
});
addCardBtn.addEventListener('click', () => {
    addCardModal.classList.add('active');
    newQuestionInput.focus();
});
cancelAddCard.addEventListener('click', () => {
    addCardModal.classList.remove('active');
    newQuestionInput.value = '';
    newAnswerInput.value = '';
});
saveCardBtn.addEventListener('click', handleAddCard);
deleteCardBtn.addEventListener('click', handleDeleteCard);
exportBtn.addEventListener('click', handleExport);
closeExportModal.addEventListener('click', () => {
    exportModal.classList.remove('active');
});
saveExportBtn.addEventListener('click', handleSaveExport);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextCard();
    if (e.key === 'ArrowLeft') prevCard();
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flipCard();
    }
});

// Initialize
populateSetSelector();
renderSetsList();
displayCard();
