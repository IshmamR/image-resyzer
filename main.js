const express = require('express');
const app = express();

const multer = require('multer');
const imageSize = require('image-size');
const sharp = require('sharp');
const zip = require('express-zip');

// node js internal modules
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

// 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
// app.use(express.static('user'));


app.get('/', (req, res) => {
	res.status(200);
	fs.createReadStream(__dirname+'/index.html').pipe(res);
});
// redirect to home
app.get('/processImage', (req, res) => {
	res.redirect('/');
})


// make directory for uploaded images if doesn't exist already
var dir = "user";
var subDir = "user/uploads"; // uploaded images
var resDir = "user/processed"; // processed images
if(!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
	fs.mkdirSync(subDir);
	fs.mkdirSync(resDir);
}

// Multer
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, subDir);
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
	},
});
var imageFilter = function (req, file, cb) {
	if (
		file.mimetype == "image/png" ||
		file.mimetype == "image/jpg" ||
		file.mimetype == "image/jpeg"
	) {
		cb(null, true);
	} else {
		cb(null, false);
		return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
	}
};
var upload = multer({ storage: storage, fileFilter: imageFilter });
//console.log(upload.array('file'));


// Posted data
var format, width, height, dimensions;
app.post('/processImage', upload.array('file'), (req, res) => {
	// console.log(req.files[0].path);
	format = req.body.format;
	width = req.body.width;
	height = req.body.height;
	// console.log(JSON.stringify(req.body));
	
	if ( isNaN(width) || isNaN(height) || width.trim() === '' || height.trim() === '' ) {
		processImage(req, res, req.files);
	} else {
		processImage(req, res, req.files);
	}
	
})

var arrayForZip = [];
// Using Sharp to resize and convert image
function processImage(req, res, imageFile) {
	// console.log('imageFile: '+imageFile)
	
	for(let i = 0; i < imageFile.length; i++) {
		
		dimensions = imageSize(imageFile[i].path);
		width = parseInt(dimensions.width);
		height = parseInt(dimensions.height);

		fileName = imageFile[i].originalname.split('.').slice(0, -1).join('.'); // file name without extension
		fileOutput = fileName + Date.now() + "." + format;
		outputFilePath = path.join(resDir, fileOutput); // "user/processed/test.png"
		// console.log(imageFile[i]);

		if (imageFile[i]) {
			sharp(imageFile[i].path)
			.resize(width, height)
			.toFile(outputFilePath, (err, info) => {
				if (err) throw err;
				// console.log(info)
				fs.unlinkSync(imageFile[i].path); // deletes file from uploads after processing
				if (i === imageFile.length - 1) {
					downloadImage(req, res);
				}
			});
		}
		
		zipObject = { path: outputFilePath, name: fileOutput };
		arrayForZip.push(zipObject);
	}
	
}

// download zip or single image
function downloadImage (req, res) {
	// console.log("zipArray: "+ arrayForZip.length)
	var numberOfFiles = arrayForZip.length;
	
	// Single image download
	if (numberOfFiles < 2 && numberOfFiles === 1) { 
		res.download(arrayForZip[0].path, (err) => {
			if (err) {
				// console.log('Path: '+arrayForZip[0].path)
				throw err;
			}
			fs.unlinkSync(arrayForZip[0].path); // delete file after download
			arrayForZip.length = 0;
		});
	}
	
	// Multiple images (zip) download
	if (numberOfFiles >= 2) { 
		res.zip(arrayForZip, 'resized.zip', (err) => {
			if (err) throw err;
			// delete files after download
			for (let i = 0; i < arrayForZip.length; i++) {
				fs.unlinkSync(arrayForZip[i].path);
			}
			arrayForZip.length = 0;
		});
			
	}
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`app is listening on port: ${PORT}`)
});