const marker = document.querySelector('#hiro-marker');
const quizCard = document.querySelector('#quiz-card');
const questionText = document.querySelector('#question-text');

window.addEventListener('load', () => {
    const scene = document.querySelector('a-scene');
    scene.addEventListener('loaded', () => {
        console.log("A-Frame Scene Loaded");
        // Check if the video element was created
        const video = document.querySelector('#arjs-video');
        if (video) {
            video.style.position = 'fixed';
            video.style.top = '0';
            video.style.left = '0';
            video.style.zIndex = '-1';
        }
    });
});

// Your data (previously treasureData.ts)
const treasures = [
    { id: 1, question: "Quem descobriu o Brasil?", answer: "Pedro Alvares Cabral" }
];

// 1. Detect when the camera sees the Hiro marker
marker.addEventListener('markerFound', () => {
    console.log("Marker Found!");
    quizCard.style.display = 'block';
    questionText.innerText = treasures[0].question;
});

// 2. Hide UI if marker is lost
marker.addEventListener('markerLost', () => {
    quizCard.style.display = 'none';
});

// 3. Handle the answer
function checkAnswer() {
    const input = document.querySelector('#answer-input').value;
    if(input.toLowerCase().trim() === treasures[0].answer.toLowerCase()) {
        alert("Correto! Você desbloqueou o próximo nível.");
        // Logic to move to next treasure or show map
    } else {
        alert("Tente novamente!");
    }
}