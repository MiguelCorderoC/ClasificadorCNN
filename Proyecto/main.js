//Declaro las variables y constantes que necesitare hasta ahora

const image_size = 150;
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let currentStream = null;
let facingMode = "user"; // user: front camera, environment: back camera
let modelo = null;
//Hago lo mismo que en colab, defino los indices de las clases con nombres
//Si no  
const classNames = ['Alexa Perez', "Bill Gates", 'Bryan', "Elon Musk", "Jeff Bezos", "Mark Zuckerberg", "Steve Jobs"];

//Mando a llamar el modelo por medio de la API
(async () => {
    console.log("Cargando modelo...");
    modelo = await tf.loadLayersModel("model.json");
    console.log("Modelo cargado");
})();

//Mando a llamar la funcion para mostrar el video o lo que se ve en la camara
window.onload = function () {
    mostrarCamara();
}

function mostrarCamara() {
    const opciones = {
        audio: false,
        video: {
            facingMode: facingMode,
            width: image_size,
            height: image_size
        }
    }

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(opciones)
            .then(function (stream) {
                currentStream = stream;
                video.srcObject = currentStream;
            })
            .catch(function (err) {
                alert("No se pudo utilizar la cámara :(");
                console.log(err);
                alert(err);
            })
    } else {
        alert("No existe la función getUserMedia");
    }
}

function tomarFoto() {
    // Captura la imagen y realiza la predicción
    ctx.drawImage(video, 0, 0, image_size, image_size); // Captura la imagen del video y dibújala en el canvas
    mostrarFoto(); // Muestra la foto capturada en el canvas
    predecir(); // Realiza la predicción del rostro en la imagen capturada

    // Actualiza la imagen de la tarjeta
    const cardImage = document.getElementById("card-image");
    cardImage.src = canvas.toDataURL(); // Asigna la imagen capturada al src de la imagen de la tarjeta

    // Actualiza el texto de la tarjeta con el resultado de la predicción
    const cardText = document.getElementById("card-text");
    cardText.textContent = predicted_class_name; // Asigna el resultado de la predicción al contenido del párrafo de la tarjeta
}

function mostrarFoto() {
    const image_data = ctx.getImageData(0, 0, image_size, image_size);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(image_data, 0, 0);
}

function predecir() {
    if (modelo != null) {
        const image_data = ctx.getImageData(0, 0, image_size, image_size);
        const tensor = tf.browser.fromPixels(image_data).toFloat().div(tf.scalar(255)).expandDims();
        const resultado = modelo.predict(tensor).dataSync();
        const predicted_class_index = resultado.indexOf(Math.max(...resultado));
        const predicted_class_name = classNames[predicted_class_index];
        document.getElementById("card-text").innerHTML = predicted_class_name;
    }
}

function cambiarCamara() {
    facingMode = facingMode == "user" ? "environment" : "user";
    mostrarCamara();
}