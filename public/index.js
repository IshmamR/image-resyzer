var fileInput = document.querySelector("input[type='file']")
// console.log(fileInput);

fileInput.addEventListener('change', handleFiles, false);
function handleFiles() {
	const files = this.files; // array of uploaded files
	// console.log(files[0]);

	const accordion = document.querySelector('#image_data');
	accordion.classList.remove('hidden');

	const accordionSummary = document.querySelector('#acc_sum');
	accordionSummary.innerText = `Uploaded files (${files.length})`;
	
	const accordionFilesList = document.querySelector('#acc_files_ul');

	var string = ''; 
	for(let i = 0; i < files.length; i++) {
		// file has name, size, type, date modified
		let name = files[i].name;
		let type = files[i].type;
		let size = files[i].size / 1024;

		string += `<li ${ i % 2 === 0 ? "class='pl-2 bg-white'" : "class='pl-2 bg-green-300'" }>
				<img data-id='${i}' 
					class='w-10 h-8 mt-1 object-cover border border-gray-500 thumbs' 
					src='${URL.createObjectURL(files[i])}' 
					alt='${files[i].name}' />
				Name: ${name}, <br /> 
				Type: ${type}, <br /> 
				Size: ${size.toFixed(2)} kb 
				</li>`;
	}
	accordionFilesList.innerHTML = string;

	var thumbImages = document.querySelectorAll('.thumbs');
	thumbImages.forEach((thumb) => {
		thumb.onclick = openModal;
		// console.log(thumb)
	})
}

var modal = document.querySelector('#modal');
var modaImage = document.querySelector('#modalImage');
var closeModal = document.querySelector('#closeModal');
var caption = document.querySelector('#modalCaption');
function openModal() {
	// console.log(this);
	modal.classList.remove('hidden');
	modalImage.src = this.src;
	caption.innerText = this.alt;
	closeModal.addEventListener('click', handleModalClose);
}

var handleModalClose = function() {
	// console.log(this);
	modal.classList.add('hidden');
}