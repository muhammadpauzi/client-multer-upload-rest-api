const inputFile = document.getElementById('inputFile');
const formUploadFile = document.getElementById('formUploadFile');
const fileUploadName = document.getElementById('fileUploadName');
const message = document.querySelector('.message');
const successStatusCode = [200, 201];
const errorStatusCode = [400, 500];

inputFile.addEventListener('change', updateInputFile);
formUploadFile.addEventListener('submit', uploadFile);

function updateInputFile() {
    fileUploadName.textContent = this.files ? this.files[0].name : 'No file choosen';
};

function uploadFile(e) {
    e.preventDefault();

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:5000/api/images/upload");
    xhr.onreadystatechange = function (e) {
        if (e.target.readyState === 4) {
            inputFile.value = ""; // reset
            updateInputFile(); // change content to "No file choosen"
            message.textContent = JSON.parse(e.target.response).message;
            if (successStatusCode.indexOf(e.target.status) != -1) { // success
                message.className = 'message message-green';
            } else if (errorStatusCode.indexOf(e.target.status) != -1) { // error
                message.className = 'message message-red';
            }
        }
    }
    const formData = new FormData();
    formData.append("file", inputFile.files[0]);
    xhr.send(formData);
}

updateInputFile();