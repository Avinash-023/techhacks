const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

// Open file input on drop zone click
dropZone.addEventListener('click', () => fileInput.click());

// Prevent default behavior (Prevent file from being opened)
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop zone when item is dragged over it
dropZone.addEventListener('dragover', () => {
    dropZone.classList.add('hover');
});
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('hover');
});

// Handle dropped files
dropZone.addEventListener('drop', (event) => {
    dropZone.classList.remove('hover');
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// Handle file selection
fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// Prevent default behavior for drag events
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleFile(file) {
    if (file.type !== 'application/pdf') {
        alert('Please upload a valid PDF file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const pdfData = new Uint8Array(e.target.result);
        pdfjsLib.getDocument(pdfData).promise.then(pdf => {
            const numPages = pdf.numPages;
            document.getElementById('output').innerHTML = ''; // Clear previous output
            const allText = [];
            let pagesProcessed = 0;

            const processPage = (pageNum) => {
                pdf.getPage(pageNum).then(page => {
                    const scale = 1.5; // Adjust scale for size
                    const viewport = page.getViewport({ scale });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    canvas.className = 'slide';

                    // Render the page
                    page.render({ canvasContext: context, viewport: viewport }).promise.then(() => {
                        document.getElementById('output').appendChild(canvas);
                    });

                    // Extract text content for reading
                    page.getTextContent().then(textContent => {
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        allText.push(pageText);
                        pagesProcessed++;

                        // If all pages processed, enable the read button
                        if (pagesProcessed === numPages) {
                            document.getElementById('readButton').disabled = false; // Enable the button
                            document.getElementById('readButton').dataset.text = allText.join('\n\n'); // Store text
                        }
                    });
                });
            };

            // Process each page
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                processPage(pageNum);
            }
        });
    };
    reader.readAsArrayBuffer(file);
}

document.getElementById('readButton').addEventListener('click', function() {
    const text = this.dataset.text.split('\n\n'); // Split text into paragraphs
    let index = 0;

    const readNextParagraph = () => {
        if (index < text.length) {
            const speech = new SpeechSynthesisUtterance(text[index]);
            speech.onend = () => {
                index++;
                readNextParagraph();
            };
            speechSynthesis.speak(speech);
        }
    };

    readNextParagraph();
});
