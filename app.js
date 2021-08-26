const inputFile = document.getElementById('inputFile');
const formUploadFile = document.getElementById('formUploadFile');
const fileUploadName = document.getElementById('fileUploadName');
const imageGridContainer = document.querySelector('.image-grid');
const message = document.querySelector('.message');
const progressBar = document.querySelector('.progress-bar');
const progressBarFill = document.querySelector('.progress-bar-fill');
const progressBarText = document.querySelector('.progress-bar-text');

const successStatusCode = [200, 201];
const errorStatusCode = [400, 500];
const maxSize = 2 * 1024 * 1024;
const allowedFileType = ['image/jpeg', 'image/png', 'image/gif'];

inputFile.addEventListener('change', updateInputFile);
formUploadFile.addEventListener('submit', uploadFile);

function showMessage(className = 'green', messageText = '') {
    message.className = `message message-${className}`;
    message.textContent = messageText;
}

function setProgressBar(width = '0', text = '0%') {
    progressBarFill.style.width = width;
    progressBarText.textContent = text;
}

function updateInputFile() {
    fileUploadName.textContent = this.files ? this.files[0].name : 'No file choosen';
    showMessage('hide'); // hide
    setProgressBar(); // reset
};

function request(method, url, cb) {
    const xhr = new XMLHttpRequest();
    try {
        xhr.open(method, url);
        cb(xhr, null);
    } catch (err) {
        cb(null, err);
    }
}

function uploadFile(e) {
    e.preventDefault();
    if (!inputFile.files[0]) {
        return showMessage('red', 'Please upload a file!');
    }
    if (inputFile.files[0].size > maxSize) {
        return showMessage('red', 'File size cannot be larger than 2MB!');
    }
    if (allowedFileType.indexOf(inputFile.files[0].type) == -1) {
        return showMessage('red', 'Only image (jpg, jpeg, png, gif) files are allowed to be uploaded.');
    }

    request('POST', "http://localhost:5000/api/images/upload", (xhr, err) => {
        if (err) {
            return console.log(err);
        }

        xhr.onreadystatechange = function (e) {
            if (e.target.readyState === 4) {
                inputFile.value = ""; // reset
                updateInputFile(); // change content to "No file choosen"
                const { message } = JSON.parse(e.target.response);
                if (successStatusCode.indexOf(e.target.status) != -1) { // success
                    showMessage('green', message);
                    showImages();
                } else if (errorStatusCode.indexOf(e.target.status) != -1) { // error
                    showMessage('red', message);
                }
            }
        }

        xhr.upload.addEventListener('progress', e => {
            const percent = e.lengthComputable ? (e.loaded / e.total) * 100 : 0;

            setProgressBar(`${percent.toFixed(2)}%`, `${percent.toFixed(2)}%`);
        });

        const formData = new FormData();
        formData.append("file", inputFile.files[0]);
        xhr.send(formData);
    });
}

function generateImage({ name, url, downloadUrl }) {
    return `
        <div class="image">
            <img src="${url}" alt="${name}">
            <a href="${downloadUrl}" class="download-link">Download</a>
        </div>
    `
}

function showImages() {
    request('GET', 'http://localhost:5000/api/images', (xhr, err) => {
        if (err) {
            return console.log(err);
        }
        xhr.onreadystatechange = function (e) {
            if (e.target.readyState === 4) {
                // if success
                if (successStatusCode.indexOf(e.target.status) != -1) {
                    const { images } = JSON.parse(e.target.response);
                    let generatedImages = '';
                    images.map(image => {
                        generatedImages += generateImage(image);
                    });
                    imageGridContainer.innerHTML = generatedImages;
                }
            }
        }
        xhr.send();
    });
}

showImages();
updateInputFile();