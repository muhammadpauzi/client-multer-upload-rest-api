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

function updateInputFile() {
    fileUploadName.textContent = this.files ? this.files[0].name : 'No file choosen';
    message.className = 'message';
    message.textContent = '';
    progressBarFill.style.width = '0';
    progressBarText.textContent = '0%';
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
        message.className = 'message message-red';
        return message.textContent = 'Please upload a file!';
    }
    if (inputFile.files[0].size > maxSize) {
        message.className = 'message message-red';
        return message.textContent = 'File size cannot be larger than 2MB!';
    }
    if (allowedFileType.indexOf(inputFile.files[0].type) == -1) {
        message.className = 'message message-red';
        return message.textContent = 'Only image (jpg, jpeg, png, gif) files are allowed to be uploaded.';
    }

    request('POST', "http://localhost:5000/api/images/upload", (xhr, err) => {
        if (err) {
            return console.log(err);
        }

        xhr.onreadystatechange = function (e) {
            if (e.target.readyState === 4) {
                inputFile.value = ""; // reset
                updateInputFile(); // change content to "No file choosen"
                message.textContent = JSON.parse(e.target.response).message;
                if (successStatusCode.indexOf(e.target.status) != -1) { // success
                    message.className = 'message message-green';
                    showImages();
                } else if (errorStatusCode.indexOf(e.target.status) != -1) { // error
                    message.className = 'message message-red';
                }
            }
        }

        xhr.upload.addEventListener('progress', e => {
            const percent = e.lengthComputable ? (e.loaded / e.total) * 100 : 0;

            progressBarFill.style.width = `${percent.toFixed(2)}%`;
            progressBarText.textContent = `${percent.toFixed(2)}%`;
        });

        const formData = new FormData();
        formData.append("file", inputFile.files[0]);
        xhr.send(formData);
    });
}

function generateImage({ url, downloadUrl }) {
    return `
        <div class="image">
            <img src="${url}" alt="">
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