document.addEventListener('DOMContentLoaded', () => {
    // ... (semua variabel di atas tidak berubah)
    const welcomeContainer = document.getElementById('welcome-container');
    const questionnaireContainer = document.getElementById('questionnaire-container');
    const resultsContainer = document.getElementById('results-container');
    const nextBtn = document.getElementById('next-btn');
    const nameInput = document.getElementById('name-input');
    const activityInput = document.getElementById('activity-input');
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
    "Saya ingin merasakan perasaan dari pengalaman [aktivitas] lagi."];
    const totalQuestions = questions.length;
    let userAnswers = {};

    // ... (fungsi-fungsi lain seperti getColorForSlider, generateQuestions, dll tidak berubah)

    // ===== FUNGSI submitBtn DIUBAH SECARA SIGNIFIKAN =====
    submitBtn.addEventListener('click', () => {
        if (Object.keys(userAnswers).length < totalQuestions) {
            alert('Harap selesaikan semua pertanyaan sebelum melihat hasil.');
            return;
        }
        
        // Nonaktifkan tombol untuk mencegah klik ganda
        submitBtn.disabled = true;
        submitBtn.textContent = "Mengirim...";

        const absorptionScore = (userAnswers['q1'] + userAnswers['q2'] + userAnswers['q3']) / 3;
        const controlScore = (userAnswers['q4'] + userAnswers['q5'] + userAnswers['q6']) / 3;
        const rewardScore = (userAnswers['q7'] + userAnswers['q8'] + userAnswers['q9']) / 3;
        const globalScore = (absorptionScore + controlScore + rewardScore) / 3;

        // Siapkan data untuk dikirim
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

        // ===== GANTI DENGAN URL WEB APP ANDA DARI LANGKAH 3 =====
        const SCRIPT_URL = https://script.google.com/macros/s/AKfycbxwdrNxvX1OwxYp_l4HhqAzqsPYP9-QAm4BRAC32NwIuJ0rDPbGd1EgKWr9fRVDGW4/exec; 

        // Kirim data ke Google Sheet
        fetch(SCRIPT_URL, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Sukses terkirim ke Google Sheet:', data);
            // Setelah berhasil, tampilkan hasil ke pengguna
            displayResults({ 
                global: globalScore, 
                absorption: absorptionScore, 
                control: controlScore, 
                reward: rewardScore 
            });
        })
        .catch(error => {
            console.error('Error saat mengirim ke Google Sheet:', error);
            // Jika gagal, tetap tampilkan hasil ke pengguna
            alert('Gagal menyimpan data, namun hasil Anda tetap akan ditampilkan.');
            displayResults({ 
                global: globalScore, 
                absorption: absorptionScore, 
                control: controlScore, 
                reward: rewardScore 
            });
        });
    });

    // ... (sisa kode lainnya tidak berubah)

});
