const link = document.querySelector('.matrix-link');
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = Array(256).join(1).split('');
let fontSize = 10;

const drawMatrix = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0F0';
    ctx.font = `${fontSize}px monospace`;

    letters.forEach((y, index) => {
        const text = String.fromCharCode(Math.random() * 128);
        const x = index * fontSize;

        ctx.fillText(text, x, y);

        letters[index] = (y > canvas.height + Math.random() * 1e4) ? 0 : y + fontSize;
    });
};

link.addEventListener('mouseover', () => {
    canvas.style.display = 'block';
    document.body.style.backgroundColor = '#000';
    setInterval(drawMatrix, 50);
});

link.addEventListener('mouseout', () => {
    canvas.style.display = 'none';
    document.body.style.backgroundColor = '#000';
});
