import './style.css'
import axios from 'axios';

const fileInput = document.getElementById('dropzone-file');
const image = document.getElementById('image');
const prediction = document.getElementById('prediction');
const description = document.getElementById('description');
const disease = document.getElementById('disease');
const acceptedImageTypes = ['image/jpeg', 'image/png'];
const inputError = document.getElementById('input-error');

let base64Image;

/**
 * Display the result in the page
 */
function displayDescription(predictions) {
  // probability analyze
  if (predictions.confidence > 0.2) {
    const probability = Math.round(predictions.confidence * 100);
    prediction.innerText = `${probability}% this is a ${predictions.top}`;
  } else {
    prediction.innerText = 'I am not sure what I should recognize 😢';
  }

  // Get the predicted diseaseName
  const diseaseName = predictions.top;

  for (let i = 0; i < infoData.length; i++) {
    if (infoData[i].diseaseName === diseaseName) {
      disease.innerText = infoData[i].diseaseName;
      description.innerText = infoData[i].description;
      break; // break out of the loop once you find the matching object
    } else {
      disease.innerText = "";
      description.innerText = "No information found";
    }
  }
}

/**
 * Classify with the image with the mobilenet model
 */
function classifyImage() {
  document.body.classList.add('loading');

  axios({
    method: "POST",
    url: import.meta.env.VITE_API_URL,
    params: {
      api_key: import.meta.env.VITE_API_KEY
    },
    data: base64Image,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .then(function (response) {
      console.log(response);
      document.body.classList.remove('loading');
      displayDescription(response.data);
    })
    .catch(function (error) {
      document.body.classList.remove('loading');
    });
}

/**
 * Get the image from file input and display on page
 */
function getImage() {
  window.scrollTo(0, 0);
  document.getElementById('result').classList.remove('hidden');
  disease.innerText = "";
  description.innerText = "No information found";
  // Check if an image has been found in the input
  if (!fileInput.files[0]) throw new Error('Image not found');
  const file = fileInput.files[0];

  // Check if file is an image
  if (!acceptedImageTypes.includes(file.type)) {
    inputError.classList.add('show');
    throw Error('The uploaded file is not an image');
  }
  else inputError.classList.remove('show');

  // Get the data url form the image
  const reader = new FileReader();

  // When reader is ready display image
  reader.onload = function (event) {
    // Ge the data url
    const dataUrl = event.target.result;

    // Create image object
    const imageElement = new Image();
    imageElement.src = dataUrl;

    // When image object is loaded
    imageElement.onload = function () {
      // Set <img /> attributes
      image.setAttribute('src', this.src);
      image.setAttribute('height', this.height);
      image.setAttribute('width', this.width);


      base64Image = reader.result.split(',')[1];

      // Classify image
      classifyImage();
    };

    // Add the image-loaded class to the body
    document.body.classList.add('image-loaded');
  };

  // Get data URL
  reader.readAsDataURL(file);
}

/**
 * Load model
 */
mobilenet.load().then((m) => {
  // When user uploads a new image, display the new image on the webpage
  fileInput.addEventListener('change', getImage);
});



const infoData = [
  {
    "diseaseName": "No_DR",
    "description": "Healthy retina with no signs of Diabetic Retinopathy."
  },
  {
    "diseaseName": "Mild",
    "description": "There are minimal signs of Diabetic Retinopathy, such as small dot-like hemorrhages, microaneurysms, or mild irregularities in blood vessels."
  },
  {
    "diseaseName": "Moderate",
    "description": "There are more significant signs of Diabetic Retinopathy, such as multiple hemorrhages, microaneurysms, or moderate irregularities in blood vessels."
  },
  {
    "diseaseName": "Proliferate_DR",
    "description": "There is the presence of new blood vessels in the retina, which is a severe form of Diabetic Retinopathy that can cause vision loss or blindness if left untreated."
  },
  {
    "diseaseName": "Severe",
    "description": "There are severe signs of Diabetic Retinopathy, such as widespread hemorrhages, exudates, or severe irregularities in blood vessels."
  },
];