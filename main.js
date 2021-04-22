const express = require('express');
const app = express();

const multer = require('multer');
const imageSize = require('image-size');
const sharp = require('sharp');

// node js internal modules
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

// 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.static('user'));


app.get('/', (req, res) => {
	res.status(200);
	fs.createReadStream(__dirname+'/index.html').pipe(res);
})


// make directory for uploaded images if doesn't exist already
var dir = "user";
var subDir = "user/uploads";
if(!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
	fs.mkdirSync(subDir);
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
// var upload = multer({ dest: 'useruploads/' });
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
		for(let i = 0; i < req.files.length; i++) {
			dimensions = imageSize(req.files[i].path);
			console.log(req.files[i].path);
			width = parseInt(dimensions.width);
			height = parseInt(dimensions.height);

			processImage(Number(width), Number(height), req, res, req.files[i]);
		}
	} else {
		for (let i = 0; i < req.files.length; i++) {
			processImage(Number(width), Number(height), req, res, req.files[i]);
		}
	}
	
})


// Using Sharp to resize and convert image
function processImage(width, height, req, res, imageFile) {
	outputFilePath = Date.now() + "output." + format;
	// console.log(width)
	if (imageFile) {
		sharp(imageFile.path)
		.resize(width, height)
		.toFile(outputFilePath, (err, info) => {
			if (err) throw err;
			res.download(outputFilePath, (err) => {
				if (err) throw err;
				fs.unlinkSync(imageFile.path);
				fs.unlinkSync(outputFilePath);
			});
		});
	}
}




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`app is listening on port: ${PORT}`)
});