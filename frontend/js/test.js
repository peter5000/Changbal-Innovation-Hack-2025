document.getElementById('audioFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const analyser = audioContext.createAnalyser();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const fftSize = 2048;
    analyser.fftSize = fftSize;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.start();

    const canvas = document.getElementById('fftCanvas');
    const canvasContext = canvas.getContext('2d');

    const fftBatch = [];
    const batchInterval = 5000; // Send batch every 5 seconds

    function sendToGeminiInChunks(batch, chunkSize, interval) {
        let index = 0;

        function sendNextChunk() {
            if (index >= batch.length) return;

            const chunk = batch.slice(index, index + chunkSize);
            fetch('/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fftData: chunk }),
            })
            .then(response => response.json())
            .then(result => {
                console.log('Gemini Analysis Result for Chunk:', result);
                // Optionally display the result on the page
            })
            .catch(error => {
                console.error('Error sending chunk to Gemini:', error);
            });

            index += chunkSize;
            setTimeout(sendNextChunk, interval); // Delay before sending the next chunk
        }

        sendNextChunk();
    }

    function draw() {
        requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        canvasContext.fillStyle = 'black';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];

            canvasContext.fillStyle = `rgb(${barHeight + 100},50,50)`;
            canvasContext.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

            x += barWidth + 1;
        }

        // Add current FFT data to the batch
        fftBatch.push(Array.from(dataArray));
    }

    // Periodically send the batch to Gemini in chunks
    setInterval(() => {
        if (fftBatch.length > 0) {
            const chunkSize = 10; // Number of FFT data arrays per chunk
            const interval = 5000; // 5 seconds between chunk requests
            sendToGeminiInChunks(fftBatch, chunkSize, interval);
            fftBatch.length = 0; // Clear the batch after initiating chunked sending
        }
    }, batchInterval);

    draw();
});
