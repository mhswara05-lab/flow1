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
        "Saya hanyut dalam aktivitas [aktivitas].",
        "Saya sangat fokus pada aktivitas [aktivitas].",
        "Semua perhatian saya tertuju pada aktivitas [aktivitas].",
        "Saya merasa bisa dengan mudah mengontrol apa yang saya lakukan.",
        "Ketika [aktivitas], saya mengalir dengan mudah.",
        "Ada rasa kelancaran dalam tindakan [aktivitas] saya.",
        "Saya merasa pengalaman [aktivitas] berharga.",
        "Pengalaman [aktivitas] terasa memuaskan.",
        "Saya ingin merasakan perasaan dari pengalaman [aktivitas] lagi."
    ];
    const totalQuestions = questions.length;
    let userAnswers = {};

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
        const colors = ["#BBDEFB", "#90CAF9", "#64B5F6", "#42A5F5", "#2196F3", "#1E88E5", "#1976D2"];
        return colors[value - 1] || colors[0];
    }

    // GANTI FUNGSI LAMA DENGAN INI
function generateQuestions(activity) {
    form.innerHTML = '';
    questions.forEach((q, index) => {
        const qNumber = index + 1;
        const dynamicQuestionText = q.replace(/\[aktivitas\]/g, `<strong>"${activity}"</strong>`);
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card'; 

        // Struktur HTML baru yang lebih sederhana
        questionCard.innerHTML = `
            <p class="question-text">${qNumber}. ${dynamicQuestionText}</p>
            <div class="slider-wrapper">
                <span class="slider-end-label">Sangat Tidak Setuju</span>
                <span class="slider-end-label">Sangat Setuju</span>
                <div class="slider-container">
                    <span class="slider-value">1</span>
                    <input type="range" min="1" max="7" value="1" class="rating-slider" id="q${qNumber}">
                    <div class="slider-labels">
                        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
                    </div>
                </div>
            </div>`;

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
        
        submitBtn.disabled = true;
        submitBtn.textContent = "Mengirim...";

        const absorptionScore = (userAnswers['q1'] + userAnswers['q2'] + userAnswers['q3']) / 3;
        const controlScore = (userAnswers['q4'] + userAnswers['q5'] + userAnswers['q6']) / 3;
        const rewardScore = (userAnswers['q7'] + userAnswers['q8'] + userAnswers['q9']) / 3;
        const globalScore = (absorptionScore + controlScore + rewardScore) / 3;

        const formData = new FormData();
        formData.append('Nama', nameInput.value.trim());
        formData.append('Aktivitas', activityInput.value.trim());
        formData.append('JenisKelamin', document.querySelector('input[name="gender"]:checked').value);
        for (let i = 1; i <= totalQuestions; i++) {
            formData.append(`Q${i}`, userAnswers[`q${i}`]);
        }
        formData.append('SkorGlobal', scale(globalScore).toFixed(2));
        formData.append('SkorAbsorption', scale(absorptionScore).toFixed(2));
        formData.append('SkorControl', scale(controlScore).toFixed(2));
        formData.append('SkorReward', scale(rewardScore).toFixed(2));

        const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyrGWN7TPihIV1M5-tjehMkzy5DsJoJjDteZTQgKs9qebyP7CF7g42iQFkf0ot1Wmc/exec"; 

        fetch(SCRIPT_URL, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Sukses terkirim ke Google Sheet:', data);
            displayResults({ 
                global: globalScore, 
                absorption: absorptionScore, 
                control: controlScore, 
                reward: rewardScore 
            });
        })
        .catch(error => {
            console.error('Error saat mengirim ke Google Sheet:', error);
            alert('Gagal menyimpan data, namun hasil Anda tetap akan ditampilkan.');
            displayResults({ 
                global: globalScore, 
                absorption: absorptionScore, 
                control: controlScore, 
                reward: rewardScore 
            });
        });
    });
    
    const scale = (score) => ((score - 1) / 6) * 99 + 1;

    function getInterpretation(score) {
        if (score > 85.7) return { text: "Sangat Tinggi", color: "#1976D2" };
        if (score > 71.4) return { text: "Tinggi", color: "#1E88E5" };
        if (score > 57.1) return { text: "Cukup Tinggi", color: "#2196F3" };
        if (score > 42.8) return { text: "Sedang", color: "#42A5F5" };
        if (score > 28.5) return { text: "Cukup Rendah", color: "#64B5F6" };
        if (score > 14.2) return { text: "Rendah", color: "#90CAF9" };
        return { text: "Sangat Rendah", color: "#BBDEFB" };
    }
    
    function updateSpectrumBar(score) {
        const spectrumBar = document.querySelector('.spectrum-bar');
        spectrumBar.innerHTML = '';
        const colors = ["#BBDEFB", "#90CAF9", "#64B5F6", "#42A5F5", "#2196F3", "#1E88E5", "#1976D2"];
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
            if (!color.startsWith('#')) return false;
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

