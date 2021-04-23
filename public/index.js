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
				${i+1}. 
				Name: ${name}, <br /> 
				Type: ${type}, <br />
				Size: ${size.toFixed(2)} kb 
				</li>`;
	}
	accordionFilesList.innerHTML = string;
}
