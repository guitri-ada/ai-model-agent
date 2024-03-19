const URL_MALE_FEMALE = 'https://teachablemachine.withgoogle.com/models/Yi7gkyK0Y/';
const URL_HAIR_COLOR = 'https://teachablemachine.withgoogle.com/models/JzL1serW6/';
const URL_AGE = 'https://teachablemachine.withgoogle.com/models/XUU4jnGiO/';


let modelMaleFemale, modelHairColor, modelAge;
let imgElement;

async function loadModels() {
    try {
        modelMaleFemale = await tmImage.load(URL_MALE_FEMALE + 'model.json', URL_MALE_FEMALE + 'metadata.json');
        console.log('Male/Female model loaded successfully');
        
        modelHairColor = await tmImage.load(URL_HAIR_COLOR + 'model.json', URL_HAIR_COLOR + 'metadata.json');
        console.log('Hair Color model loaded successfully');
        
        modelAge = await tmImage.load(URL_AGE + 'model.json', URL_AGE + 'metadata.json');
        console.log('Age model loaded successfully');
    } catch (error) {
        console.error('Error loading models', error);
    }
}

loadModels();

document.getElementById('imageUpload').addEventListener('change', (event) => {
    const imageContainer = document.getElementById('imageContainer');
    const resultsContainer = document.getElementById('results');
    
    while (imageContainer.firstChild) {
        imageContainer.removeChild(imageContainer.firstChild);
    }

    resultsContainer.innerHTML = '';

    imgElement = document.createElement('img');
    imgElement.src = URL.createObjectURL(event.target.files[0]);
    
    imgElement.onload = () => {
        URL.revokeObjectURL(imgElement.src);
        imageContainer.appendChild(imgElement);
     }
});

function getPredictionDescription(predictions) {
    // Generate the description based on the best prediction
    if (predictions.probability.toFixed(2) < 0.6) return `could be ${predictions.className}`;
    if (predictions.probability.toFixed(2) >= 0.6 && predictions.probability.toFixed(2) < 0.8) return `is likely ${predictions.className}`;
    if (predictions.probability.toFixed(2) >= 0.8) return `is ${predictions.className}`;
}

async function classifyImage() {
    try {
        const resultsMaleFemale = await modelMaleFemale.predict(imgElement);
        const resultsHairColor = await modelHairColor.predict(imgElement);
        const resultsAge = await modelAge.predict(imgElement);

        // Sort predictions by probability in descending order
        const sortedResultsMaleFemale = resultsMaleFemale.sort((a, b) => b.probability - a.probability);
        const sortedResultsHairColor = resultsHairColor.sort((a, b) => b.probability - a.probability);
        const sortedResultsAge = resultsAge.sort((a, b) => b.probability - a.probability);

        // Get the most confident prediction for each model
        const bestPredictionMaleFemale = sortedResultsMaleFemale[0];
        const bestPredictionHairColor = sortedResultsHairColor[0];
        const bestPredictionAge = sortedResultsAge[0];

        // Generate description based on the best predictions
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = `
        Subject ${getPredictionDescription(bestPredictionMaleFemale)}<br>
        Subject hair ${getPredictionDescription(bestPredictionHairColor)}<br>
        Subject ${getPredictionDescription(bestPredictionAge)}<br>
        `;
    } catch (error) {
        console.error('Error classifying image', error);
    }
}

