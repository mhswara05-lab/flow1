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
        "Saya hanyut ketika melakukan aktivitas [aktivitas].",
        "Ketika [aktivitas], saya akan menjadi sangat fokus pada hal tersebut.",
        "Ketika [aktivitas], saya akan memfokuskan semua perhatian pada hal tersebut.",
        "Saya merasa bisa dengan mudah mengendalikan apa yang saya lakukan.",
        "Ketika [aktivitas], seringkali saya melakukannya secara mengalir.",
        "Ketika [aktivitas], seringkali saya merasa melakukannya dengan lancar.",
        "Ketika [aktivitas], saya meyakini pengalamannya adalah hal yang berharga.",
        "Seringkali saya mendapat pengalaman yang memuaskan ketika [aktivitas].",
        "Untuk beberapa hal, saya ingin merasakan pengalaman [aktivitas] yang berulang."
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
        // 6-step palette (for values 1..6)
        const colors = ["#BBDEFB", "#90CAF9", "#64B5F6", "#42A5F5", "#2196F3", "#1E88E5"];
        return colors[Math.max(0, Math.min(colors.length - 1, value - 1))] || colors[0];
    }

    function generateQuestions(activity) {
        form.innerHTML = '';
        questions.forEach((q, index) => {
            const qNumber = index + 1;
            const dynamicQuestionText = q.replace(/\[aktivitas\]/g, `<strong>"${activity}"</strong>`);
            const questionCard = document.createElement('div');
            questionCard.className = 'question-card'; 
            questionCard.innerHTML = `
                <p class="question-text">${qNumber}. ${dynamicQuestionText}</p>
                <div class="slider-wrapper">
                    <div class="slider-labels-top">
                        <span class="slider-end-label">Sangat Tidak Sesuai</span>
                        <span class="slider-end-label">Sangat Sesuai</span>
                    </div>
                    <div class="slider-container">
                        <span class="slider-value">1</span>
                        <input type="range" min="1" max="6" value="1" class="rating-slider" id="q${qNumber}">
                        <div class="slider-labels">
                            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
                        </div>
                    </div>
                </div>`;
            form.appendChild(questionCard);
            const slider = questionCard.querySelector('.rating-slider');
            const valueSpan = questionCard.querySelector('.slider-value');
            slider.style.setProperty('--value-percent', `0%`);
            slider.style.setProperty('--slider-color', getColorForSlider(1));

            // If user clicks/touches the slider at its current value (e.g. 1),
            // an input event may not fire. Use pointerdown to register the
            // current value as an answer so selecting "1" works on unanswered items.
            slider.addEventListener('pointerdown', (e) => {
                const id = slider.id;
                const val = parseInt(slider.value);
                if (!userAnswers[id]) {
                    userAnswers[id] = val;
                    updateProgress(Object.keys(userAnswers).length);
                }
                const percent = ((val - slider.min) / (slider.max - slider.min)) * 100;
                slider.style.setProperty('--value-percent', `${percent}%`);
                const newColor = getColorForSlider(val);
                slider.style.setProperty('--slider-color', newColor);
                if (valueSpan) {
                    valueSpan.textContent = val;
                    valueSpan.style.left = `calc(${percent}% + (${12 - percent * 0.24}px))`;
                }
                const parentCard = slider.closest('.question-card');
                if (parentCard) {
                    parentCard.classList.add('answered');
                    parentCard.style.setProperty('--slider-color', newColor);
                }
            });
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
        // Ensure we have values for every question (use current slider value if not interacted)
        for (let i = 1; i <= totalQuestions; i++) {
            const key = `q${i}`;
            if (!userAnswers[key]) {
                const el = document.getElementById(key);
                if (el) userAnswers[key] = parseInt(el.value);
            }
        }

        if (Object.keys(userAnswers).length < totalQuestions) {
            alert('Harap selesaikan semua pertanyaan sebelum melihat hasil.');
            return;
        }
        
        submitBtn.disabled = true;

        const absorptionScore = (userAnswers['q1'] + userAnswers['q2'] + userAnswers['q3']) / 3;
        // Enjoyment is the combination of Effortless Control (q4-q6) and Intrinsic Reward (q7-q9)
        const enjoymentScore = (
            userAnswers['q4'] + userAnswers['q5'] + userAnswers['q6'] +
            userAnswers['q7'] + userAnswers['q8'] + userAnswers['q9']
        ) / 6;
        const globalScore = (absorptionScore + enjoymentScore) / 2;

        // Tampilkan hasil terlebih dahulu
        displayResults({ 
            global: globalScore, 
            absorption: absorptionScore, 
            enjoyment: enjoymentScore
        });

        // Kirim data di latar belakang
        const formData = new FormData();
        formData.append('Nama', nameInput.value.trim());
        formData.append('Aktivitas', activityInput.value.trim());
        formData.append('JenisKelamin', document.querySelector('input[name="gender"]:checked').value);
        for (let i = 1; i <= totalQuestions; i++) {
            formData.append(`Q${i}`, userAnswers[`q${i}`]);
        }
        formData.append('SkorGlobal', scale(globalScore).toFixed(2));
        formData.append('SkorAbsorption', scale(absorptionScore).toFixed(2));
        formData.append('SkorEnjoyment', scale(enjoymentScore).toFixed(2));

        const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyrGWN7TPihIV1M5-tjehMkzy5DsJoJjDteZTQgKs9qebyP7CF7g42iQFkf0ot1Wmc/exec"; 

        fetch(SCRIPT_URL, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Sukses terkirim ke Google Sheet:', data);
        })
        .catch(error => {
            console.error('Error saat mengirim ke Google Sheet:', error);
        });
    });
    
    // Map an average score in the 1..6 range to approximately 1..100 for display
    const scale = (score) => ((score - 1) / 5) * 99 + 1;
    function getInterpretation(score) {
        // Using 6 equal bands across 0-100 (approx 16.66% per band) - kept for global spectrum
        if (score > 83.33) return { text: "Sangat Tinggi", color: "#1E88E5" };
        if (score > 66.66) return { text: "Tinggi", color: "#2196F3" };
        if (score > 50.0) return { text: "Cukup Tinggi", color: "#42A5F5" };
        if (score > 33.33) return { text: "Sedang", color: "#64B5F6" };
        if (score > 16.66) return { text: "Cukup Rendah", color: "#90CAF9" };
        return { text: "Rendah", color: "#BBDEFB" };
    }

    // Interpret a scaled score (1..100) using provided cutoffs for each variable.
    // Returns {text, color} where color maps to the palette used elsewhere.
    function interpretByNorms(scaledScore, varName) {
        // Ensure numeric
        const s = Number(scaledScore);
        if (isNaN(s)) return { text: '—', color: '#BBDEFB' };

        if (varName === 'FA') {
            // TOTAL_FA cutoffs (1-100 scale)
            // Sangat Rendah: < 48.64
            // Rendah: 48.64 – 59.32
            // Cukup: 59.32 – 80.68
            // Tinggi: 80.68 – 91.36
            // Sangat Tinggi: > 91.36
            if (s < 48.64) return { text: 'Sangat Rendah', color: '#BBDEFB' };
            if (s <= 59.32) return { text: 'Rendah', color: '#90CAF9' };
            if (s <= 80.68) return { text: 'Cukup', color: '#64B5F6' };
            if (s <= 91.36) return { text: 'Tinggi', color: '#42A5F5' };
            return { text: 'Sangat Tinggi', color: '#2196F3' };
        }

        if (varName === 'FE') {
            // TOTAL_FEenjoyment cutoffs
            // Sangat Rendah: < 51.64
            // Rendah: 51.64 – 61.40
            // Cukup: 61.40 – 80.92
            // Sangat Tinggi: > 90.68
            if (s < 51.64) return { text: 'Sangat Rendah', color: '#BBDEFB' };
            if (s <= 61.40) return { text: 'Rendah', color: '#90CAF9' };
            if (s <= 80.92) return { text: 'Cukup', color: '#64B5F6' };
            if (s <= 90.68) return { text: 'Tinggi', color: '#42A5F5' };
            return { text: 'Sangat Tinggi', color: '#2196F3' };
        }

        if (varName === 'GLOBAL') {
            // TOTAL (Global) cutoffs
            // Sangat Rendah : < 55.16
            // Rendah : 55.16 – 65.38
            // Cukup : 65.38 – 85.78
            // Tinggi : 85.78 – 96.00
            // Sangat Tinggi : > 96.00
            if (s < 55.16) return { text: 'Sangat Rendah', color: '#BBDEFB' };
            if (s <= 65.38) return { text: 'Rendah', color: '#90CAF9' };
            if (s <= 85.78) return { text: 'Cukup', color: '#64B5F6' };
            if (s <= 96.00) return { text: 'Tinggi', color: '#42A5F5' };
            return { text: 'Sangat Tinggi', color: '#2196F3' };
        }

        // Fallback
        return { text: '—', color: '#BBDEFB' };
    }
    
    function updateSpectrumBar(score) {
        const spectrumBar = document.querySelector('.spectrum-bar');
        spectrumBar.innerHTML = '';
        // Render spectrum segments according to GLOBAL cutoffs (1-100 scale)
        // GLOBAL cutoffs widths: [0-55.16), [55.16-65.38], [65.38-85.78], [85.78-96.00], (96.00-100]
        const widths = [55.16, 10.22, 20.4, 10.22, 4.0];
        const colors = ["#BBDEFB", "#90CAF9", "#64B5F6", "#42A5F5", "#2196F3"];
        const interpretation = interpretByNorms(score, 'GLOBAL');

        let cumulative = 0;
        for (let i = 0; i < colors.length; i++) {
            const segment = document.createElement('div');
            segment.className = 'spectrum-segment';
            segment.style.backgroundColor = colors[i];
            // use flex-basis so segments reflect actual widths
            segment.style.flex = `0 0 ${widths[i]}%`;
            segment.style.maxWidth = `${widths[i]}%`;
            segment.style.boxSizing = 'border-box';
            // highlight the segment that corresponds to interpretation
            // (match by color)
            if (colors[i] === interpretation.color) {
                // Highlight by solid border only (no transform/animation)
                segment.style.border = '2px solid rgba(0,0,0,0.45)';
            }
            spectrumBar.appendChild(segment);
            cumulative += widths[i];
        }

        // Add a marker to indicate the exact score position on the 1-100 scale
        const marker = document.createElement('div');
        marker.className = 'spectrum-marker';
        const clamped = Math.max(0, Math.min(100, Number(score)));
        marker.style.left = `${clamped}%`;
        spectrumBar.appendChild(marker);
    }
    
    function displayResults(scores) {
        questionnaireContainer.style.display = 'none';
        resultsContainer.style.display = 'block';

        const resultSummary = document.getElementById('result-summary');
        resultSummary.innerHTML = `<p><strong>Nama:</strong> ${nameInput.value}</p><p><strong>Aktivitas:</strong> ${activityInput.value}</p>`;
        
        const scaledGlobal = scale(scores.global);
        const globalInterpretation = interpretByNorms(scaledGlobal, 'GLOBAL');
        document.getElementById('global-score-value').innerHTML = `${Math.round(scaledGlobal)} <span>/ 100</span>`;
        const globalInterpElement = document.getElementById('global-interpretation');
        globalInterpElement.textContent = globalInterpretation.text;
        
        const leftContent = document.querySelector('.results-left-content');
        const headerTitle = document.querySelector('.results-left-content .results-header h1');
        const summaryParagraphs = document.querySelectorAll('.results-left-content #result-summary p');
        const scoreColor = globalInterpretation.color;
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
        
        // Absorption: scale for display, interpret based on FA cutoffs (1-100)
        const scaledAbsorption = scale(scores.absorption);
        const absorptionInterpretation = interpretByNorms(scaledAbsorption, 'FA');
        document.getElementById('absorption-score').textContent = `${scaledAbsorption.toFixed(2)} / 100`;
        const absorptionInterpElement = document.getElementById('absorption-interpretation');
        absorptionInterpElement.textContent = absorptionInterpretation.text;
        absorptionInterpElement.style.color = absorptionInterpretation.color;
        animateCircularBar('absorption-circle', 'absorption-value', scaledAbsorption, absorptionInterpretation.color);

        // Enjoyment: scale for display, interpret based on FE cutoffs (1-100)
        const scaledEnjoyment = scale(scores.enjoyment);
        const enjoymentInterpretation = interpretByNorms(scaledEnjoyment, 'FE');
        document.getElementById('enjoyment-score').textContent = `${scaledEnjoyment.toFixed(2)} / 100`;
        const enjoymentInterpElement = document.getElementById('enjoyment-interpretation');
        enjoymentInterpElement.textContent = enjoymentInterpretation.text;
        enjoymentInterpElement.style.color = enjoymentInterpretation.color;
        animateCircularBar('enjoyment-circle', 'enjoyment-value', scaledEnjoyment, enjoymentInterpretation.color);

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
