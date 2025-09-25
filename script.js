document.addEventListener('DOMContentLoaded', () => {
    // Variabel untuk setiap "Halaman"
    const welcomeContainer = document.getElementById('welcome-container');
    const questionnaireContainer = document.getElementById('questionnaire-container');
    const resultsContainer = document.getElementById('results-container');
    
    // Elemen Halaman 1
    const nextBtn = document.getElementById('next-btn');
    const nameInput = document.getElementById('name-input');
    const activityInput = document.getElementById('activity-input');

    // Elemen Halaman 2
    const form = document.getElementById('pfs-form');
    const submitBtn = document.getElementById('submit-btn');
    const progressBarInner = document.getElementById('progress-bar-inner');
    const progressText = document.getElementById('progress-text');
    
    const questions = [
        "Saya tenggelam dalam [aktivitas].", "Saya sangat fokus pada [aktivitas].", "Semua perhatian saya tertuju pada [aktivitas].", "Saya merasa bisa dengan mudah mengontrol apa yang saya lakukan.", "Tindakan saya mengalir dengan mudah.", "Ada rasa kelancaran dalam tindakan saya.", "Saya merasa pengalaman itu berharga.", "Pengalaman itu terasa memuaskan.", "Saya ingin merasakan perasaan dari pengalaman itu lagi."
    ];
    const totalQuestions = questions.length;
    const userAnswers = {};

    // Pindah dari Halaman 1 ke Halaman 2
    nextBtn.addEventListener('click', () => {
        const userName = nameInput.value.trim();
        const userActivity = activityInput.value.trim();
        if (userName === '' || userActivity === '') {
            alert('Silakan isi Nama dan Aktivitas Anda terlebih dahulu.');
            return;
        }
        generateQuestions(userActivity);
        welcomeContainer.style.display = 'none';
        questionnaireContainer.style.display = 'block';
    });

    function getColorForSlider(value) {
        const colors = ["#cce5ff", "#8ccaff", "#4da3ff", "#007bff", "#0056b3", "#004085", "#003875"];
        return colors[value - 1] || colors[0];
    }

    function generateQuestions(activity) {
        questions.forEach((q, index) => {
            const qNumber = index + 1;
            const dynamicQuestionText = q.replace('[aktivitas]', `<strong>"${activity}"</strong>`);
            const questionCard = document.createElement('div');
            questionCard.className = 'question-card'; 
            questionCard.innerHTML = `<p class="question-text">${qNumber}. ${dynamicQuestionText}</p><div class="slider-wrapper"><span class="slider-end-label">Sangat Tidak Setuju</span><div class="slider-container"><span class="slider-value">1</span><input type="range" min="1" max="7" value="1" class="rating-slider" id="q${qNumber}"><div class="slider-labels"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span></div></div><span class="slider-end-label">Sangat Setuju</span></div>`;
            form.appendChild(questionCard);
            const slider = questionCard.querySelector('.rating-slider');
            slider.style.setProperty('--value-percent', `0%`);
            slider.style.setProperty('--slider-color', getColorForSlider(1));
        });
    }

    form.addEventListener('input', (event) => {
        if (event.target.classList.contains('rating-slider')) {
            const slider = event.target;
            const value = slider.value;
            const valueSpan = slider.parentElement.querySelector('.slider-value');
            
            if (!userAnswers[slider.id]) { 
                updateProgress(Object.keys(userAnswers).length + 1);
            }
            userAnswers[slider.id] = parseInt(value);
            
            const percent = ((value - slider.min) / (slider.max - slider.min)) * 100;
            slider.style.setProperty('--value-percent', `${percent}%`);
            
            const newColor = getColorForSlider(value);
            slider.style.setProperty('--slider-color', newColor);
            
            valueSpan.textContent = value;
            valueSpan.style.left = `calc(${percent}% + (${12 - percent * 0.24}px))`;

            const parentCard = slider.closest('.question-card');
            if (parentCard) {
                parentCard.classList.add('answered');
                parentCard.style.setProperty('--slider-color', newColor);
            }
        }
    });

    form.addEventListener('change', (event) => {
        if (event.target.classList.contains('rating-slider')) {
            const currentCard = event.target.closest('.question-card');
            const nextCard = currentCard.nextElementSibling;

            if (nextCard && nextCard.classList.contains('question-card')) {
                setTimeout(() => {
                    nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 200);
            }
        }
    });

    function updateProgress(answeredCount) {
        const progressPercentage = (answeredCount / totalQuestions) * 100;
        progressBarInner.style.width = `${progressPercentage}%`;
        progressText.textContent = `${answeredCount}/${totalQuestions} Selesai`;
        if (answeredCount === totalQuestions) {
            submitBtn.disabled = false;
        }
    }
    
    submitBtn.addEventListener('click', () => {
        if (Object.keys(userAnswers).length < totalQuestions) {
            alert('Harap selesaikan semua pertanyaan sebelum melihat hasil.');
            return;
        }
        
        const absorptionScore = (userAnswers['q1'] + userAnswers['q2'] + userAnswers['q3']) / 3;
        const controlScore = (userAnswers['q4'] + userAnswers['q5'] + userAnswers['q6']) / 3;
        const rewardScore = (userAnswers['q7'] + userAnswers['q8'] + userAnswers['q9']) / 3;
        const globalScore = (absorptionScore + controlScore + rewardScore) / 3;
        
        displayResults({ 
            global: globalScore, 
            absorption: absorptionScore, 
            control: controlScore, 
            reward: rewardScore 
        });
    });
    
    const scale = (score) => ((score - 1) / 6) * 99 + 1;

    function getInterpretation(score) {
        if (score > 85.7) return { text: "Sangat Tinggi", color: "#003875" };
        if (score > 71.4) return { text: "Tinggi", color: "#0056b3" };
        if (score > 57.1) return { text: "Cukup Tinggi", color: "#007bff" };
        if (score > 42.8) return { text: "Sedang", color: "#4da3ff" };
        if (score > 28.5) return { text: "Cukup Rendah", color: "#8ccaff" };
        if (score > 14.2) return { text: "Rendah", color: "#cce5ff" };
        return { text: "Sangat Rendah", color: "#e9f5ff" };
    }
    
    function updateSpectrumBar(score) {
        const spectrumBar = document.querySelector('.spectrum-bar');
        spectrumBar.innerHTML = '';
        const colors = ["#e9f5ff", "#cce5ff", "#8ccaff", "#4da3ff", "#007bff", "#0056b3", "#003875"];
        const interpretation = getInterpretation(score);

        for(let i=0; i < 7; i++) {
            const segment = document.createElement('div');
            segment.className = 'spectrum-segment';
            segment.style.backgroundColor = colors[i];
            if (colors[i] === interpretation.color) {
                segment.style.border = '2px solid #333';
                segment.style.transform = 'scale(1.1)';
            }
            spectrumBar.appendChild(segment);
        }
    }
    
    function displayResults(scores) {
        questionnaireContainer.style.display = 'none';
        resultsContainer.style.display = 'block';

        const resultSummary = document.getElementById('result-summary');
        resultSummary.innerHTML = `<p><strong>Nama:</strong> ${nameInput.value}</p><p><strong>Aktivitas:</strong> ${activityInput.value}</p>`;
        
        const scaledGlobal = scale(scores.global);
        const globalInterpretation = getInterpretation(scaledGlobal);
        document.getElementById('global-score-value').innerHTML = `${Math.round(scaledGlobal)} <span>/ 100</span>`;
        const globalInterpElement = document.getElementById('global-interpretation');
        globalInterpElement.textContent = globalInterpretation.text;
        
        const leftContent = document.querySelector('.results-left-content');
        const headerTitle = document.querySelector('.results-left-content .results-header h1');
        const summaryParagraphs = document.querySelectorAll('.results-left-content #result-summary p');
        const scoreColor = getInterpretation(scaledGlobal).color;
        leftContent.style.backgroundColor = scoreColor;

        const isDarkBackground = (color) => {
            const hex = color.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance < 0.6;
        };

        if (isDarkBackground(scoreColor)) {
            headerTitle.style.color = 'white';
            summaryParagraphs.forEach(p => p.style.color = 'white');
        } else {
            headerTitle.style.color = 'var(--dark-blue)';
            summaryParagraphs.forEach(p => p.style.color = 'var(--text-color)');
        }
        
        updateSpectrumBar(scaledGlobal);
        
        const scaledAbsorption = scale(scores.absorption);
        const absorptionInterpretation = getInterpretation(scaledAbsorption);
        document.getElementById('absorption-score').textContent = `${scaledAbsorption.toFixed(2)} / 100`;
        const absorptionInterpElement = document.getElementById('absorption-interpretation');
        absorptionInterpElement.textContent = absorptionInterpretation.text;
        absorptionInterpElement.style.color = absorptionInterpretation.color;
        animateCircularBar('absorption-circle', 'absorption-value', scaledAbsorption, absorptionInterpretation.color);

        const scaledControl = scale(scores.control);
        const controlInterpretation = getInterpretation(scaledControl);
        document.getElementById('control-score').textContent = `${scaledControl.toFixed(2)} / 100`;
        const controlInterpElement = document.getElementById('control-interpretation');
        controlInterpElement.textContent = controlInterpretation.text;
        controlInterpElement.style.color = controlInterpretation.color;
        animateCircularBar('control-circle', 'control-value', scaledControl, controlInterpretation.color);
        
        const scaledReward = scale(scores.reward);
        const rewardInterpretation = getInterpretation(scaledReward);
        document.getElementById('reward-score').textContent = `${scaledReward.toFixed(2)} / 100`;
        const rewardInterpElement = document.getElementById('reward-interpretation');
        rewardInterpElement.textContent = rewardInterpretation.text;
        rewardInterpElement.style.color = rewardInterpretation.color;
        animateCircularBar('reward-circle', 'reward-value', scaledReward, rewardInterpretation.color);

        window.scrollTo(0, 0);
    }

    function animateCircularBar(circleId, valueId, finalScore, color) {
        const circle = document.getElementById(circleId);
        const valueSpan = document.getElementById(valueId);
        let startValue = 0;
        const finalValue = Math.round(finalScore);
        if (finalValue <= 0) {
            valueSpan.textContent = 0;
            circle.style.background = `conic-gradient(#e9ecef 360deg, #e9ecef 0deg)`;
            return;
        }
        const duration = 1500;
        const intervalTime = Math.max(duration / finalValue, 10);

        let counter = setInterval(() => {
            startValue += 1;
            valueSpan.textContent = startValue;
            if (startValue >= finalValue) {
                clearInterval(counter);
            }
        }, intervalTime);
        
        const finalAngle = Math.round(finalScore * 3.6);
        circle.style.background = `conic-gradient(${color} ${finalAngle}deg, #e9ecef 0deg)`;
        valueSpan.style.color = color;
    }
});