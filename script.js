// App logic for MCQ Quiz

const app = (() => {
    let questionData = [];
    let userAnswers = {};
    let isSubmitted = false;

    // DOM Elements
    const container = document.getElementById('questions-container');
    const submitActions = document.getElementById('submit-actions');
    const modal = document.getElementById('results-modal');

    const init = () => {
        // 'questions' is loaded globally from questions.js
        if (typeof questions !== 'undefined' && Array.isArray(questions)) {
            questionData = questions;
            renderAllQuestions();
        } else {
            container.innerHTML = '<p style="color:red; text-align:center;">Error loading questions data.</p>';
        }
    };

    const renderAllQuestions = () => {
        container.innerHTML = ''; // clear loading
        submitActions.classList.remove('hidden');

        questionData.forEach((q, index) => {
            const card = document.createElement('div');
            card.className = 'question-card';
            card.id = `q-${index}`;
            card.style.animationDelay = `${Math.min(index * 0.05, 1)}s`;

            // Setup options HTML
            const optsArray = ['A', 'B', 'C', 'D'];
            let optionsHtml = '';

            optsArray.forEach(opt => {
                if (q.options[opt]) {
                    optionsHtml += `
                        <button class="option-btn" id="btn-${index}-${opt}" onclick="app.selectOption(${index}, '${opt}')">
                            <span class="opt-letter">${opt}</span>
                            <span class="opt-text">${q.options[opt]}</span>
                        </button>
                    `;
                }
            });

            card.innerHTML = `
                <div class="question-header">
                    <div class="q-num">${index + 1}</div>
                    <div class="q-text">${q.question}</div>
                </div>
                <div class="options-grid" id="opts-${index}">
                    ${optionsHtml}
                </div>
                <div class="feedback-box" id="feedback-${index}">
                    <i class="fa-solid fa-circle-info"></i>
                    <span class="feedback-text"></span>
                </div>
            `;

            container.appendChild(card);
        });
    };

    const selectOption = (qIndex, opt) => {
        if (isSubmitted || userAnswers[qIndex]) return; // Disallow changes after submission or if already answered

        // Save answer
        userAnswers[qIndex] = opt;

        const q = questionData[qIndex];
        const correctChoice = q.answer;
        const card = document.getElementById(`q-${qIndex}`);
        const feedbackBox = document.getElementById(`feedback-${qIndex}`);
        const feedbackText = feedbackBox.querySelector('.feedback-text');

        // Visual update
        const optsContainer = document.getElementById(`opts-${qIndex}`);
        const buttons = optsContainer.querySelectorAll('.option-btn');

        // Disable all buttons to freeze state for this question
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.cursor = 'default';
        });

        // Mark selected option
        const selectedBtn = document.getElementById(`btn-${qIndex}-${opt}`);
        selectedBtn.classList.add('selected');

        // Mark correct option
        const correctBtn = document.getElementById(`btn-${qIndex}-${correctChoice}`);
        if (correctBtn) correctBtn.classList.add('correct');

        if (opt === correctChoice) {
            // Correct answer
            card.classList.add('status-correct');
            feedbackText.innerText = 'Correct Answer!';
            feedbackBox.querySelector('i').className = 'fa-solid fa-circle-check';
        } else {
            // Wrong answer
            card.classList.add('status-wrong');
            feedbackText.innerHTML = `Incorrect. The right answer is <strong>${correctChoice}</strong>.`;
            feedbackBox.querySelector('i').className = 'fa-solid fa-circle-xmark';

            // Mark wrong option
            if (selectedBtn) selectedBtn.classList.add('wrong');
        }
    };

    const submitQuiz = () => {
        // Ask for confirmation if questions are unanswered
        const unanswered = questionData.length - Object.keys(userAnswers).length;
        if (unanswered > 0) {
            if (!confirm(`You have ${unanswered} unanswered questions. Are you sure you want to submit?`)) return;
        }

        isSubmitted = true;
        let score = 0;

        // Evaluate each question
        questionData.forEach((q, index) => {
            const card = document.getElementById(`q-${index}`);
            const userChoice = userAnswers[index];
            const correctChoice = q.answer;

            if (userChoice === correctChoice) {
                score++;
            }

            // If question was not answered, show correct answer now
            if (!userChoice) {
                const feedbackBox = document.getElementById(`feedback-${index}`);
                const feedbackText = feedbackBox.querySelector('.feedback-text');

                // Disable all buttons
                const buttons = card.querySelectorAll('.option-btn');
                buttons.forEach(btn => {
                    btn.disabled = true;
                    btn.style.cursor = 'default';
                });

                // Mark correct option
                const correctBtn = document.getElementById(`btn-${index}-${correctChoice}`);
                if (correctBtn) correctBtn.classList.add('correct');

                card.classList.add('status-wrong');
                feedbackText.innerHTML = `Unanswered. The right answer is <strong>${correctChoice}</strong>.`;
                feedbackBox.querySelector('i').className = 'fa-solid fa-circle-xmark';
            }
        });

        // Show Modal
        document.getElementById('final-score').innerText = score;
        document.querySelector('.score-text .total').innerText = `/${questionData.length}`;

        const percentage = (score / questionData.length) * 100;
        let msg = '';
        let icon = 'fa-trophy';
        let iconColor = '#ffd700';

        if (percentage >= 90) { msg = "Excellent! You are an AI Master."; }
        else if (percentage >= 70) { msg = "Great Job! You have a solid understanding."; }
        else if (percentage >= 50) { msg = "Good effort, but there's room for improvement."; icon = 'fa-thumbs-up'; iconColor = '#58a6ff'; }
        else { msg = "Don't give up! Review the answers and try again."; icon = 'fa-book'; iconColor = '#f85149'; }

        document.getElementById('feedback-message').innerText = msg;
        const modalIcon = document.querySelector('.modal-icon');
        modalIcon.className = `fa-solid ${icon} modal-icon`;
        modalIcon.style.color = iconColor;
        modalIcon.style.filter = `drop-shadow(0 0 15px ${iconColor}80)`; // add shadow

        modal.classList.remove('hidden');

        // Hide submit button, show live score in header
        submitActions.classList.add('hidden');
        const liveScore = document.getElementById('live-score');
        liveScore.classList.remove('hidden');
        document.getElementById('current-score').innerText = score;

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const closeModal = () => {
        modal.classList.add('hidden');
    };

    const resetQuiz = () => {
        userAnswers = {};
        isSubmitted = false;
        closeModal();
        document.getElementById('live-score').classList.add('hidden');
        renderAllQuestions();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Public API
    return {
        init,
        selectOption,
        submitQuiz,
        closeModal,
        resetQuiz
    };
})();

// Boot app when DOM is ready
document.addEventListener('DOMContentLoaded', app.init);
