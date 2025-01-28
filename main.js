// import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

// const ffmpeg = createFFmpeg({ log: true });

(async () => {
  await ffmpeg.load();
  console.log('FFmpeg is ready!');
})();

// Créer le lecteur vidéo
var player = videojs("my-video");

// Activer le plugin Video.js Trimmer
player.trimmer();

// Suivre l'événement de changement de découpage
player.on("trimmerchange", function (event, data) {
  console.log(
    "Trimming interval changed:",
    data.startTime,
    "s -",
    data.endTime,
    "s"
  );

  // Variables pour les heures de début et de fin
  const startTime = data.startTime; // Heure de début du découpage
  const endTime = data.endTime; // Heure de fin du découpage

  // Charger le fichier vidéo
  const videoFile = document.querySelector("video").src;

  // Appeler la fonction pour découper la vidéo
  trimVideo(videoFile, startTime, endTime);
});

// Créer le bouton et ajouter un événement au clic
document.getElementById("trimButton").addEventListener("click", function () {
  // Vérifier si le plugin videojs-trimmer a modifié l'intervalle
  const startTime = player.trimmer().getStartTime(); // Accéder à la valeur de début du découpage
  const endTime = player.trimmer().getEndTime(); // Accéder à la valeur de fin du découpage

  console.log("Découper de", startTime, "à", endTime);

  // Appeler la fonction pour découper la vidéo
  const videoFile = document.querySelector("video").src; // Récupérer l'URL de la vidéo
  trimVideo(videoFile, startTime, endTime); // Appeler la fonction trimVideo
});

// Fonction pour découper la vidéo avec FFmpeg.js
function trimVideo(inputFile, startTime, endTime) {
  // Charger le fichier vidéo
  const xhr = new XMLHttpRequest();
  xhr.open("GET", inputFile, true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function () {
    const fileData = xhr.response;

    // Initialiser FFmpeg.js
    const ffmpeg = FFmpeg.createFFmpeg({ log: true });

    // Charger le fichier vidéo dans FFmpeg.js
    ffmpeg.load().then(() => {
      // Ajouter le fichier vidéo dans le système de fichiers virtuel de FFmpeg.js
      ffmpeg.FS("writeFile", "input.mp4", new Uint8Array(fileData));

      // Appliquer les options de découpage
      ffmpeg
        .run(
          "-i",
          "input.mp4", // Fichier d'entrée
          "-ss",
          startTime, // Heure de début
          "-to",
          endTime, // Heure de fin
          "-c:v",
          "libx264", // Codec vidéo
          "-preset",
          "ultrafast", // Vitesse d'encodage
          "-f",
          "mp4", // Format de sortie
          "output.mp4" // Fichier de sortie
        )
        .then(() => {
          // Récupérer le fichier généré
          const outputData = ffmpeg.FS("readFile", "output.mp4");

          // Créer une URL pour la vidéo découpée
          const url = URL.createObjectURL(
            new Blob([outputData.buffer], { type: "video/mp4" })
          );

          // Afficher la vidéo découpée dans la division #show
          const videoElement = document.createElement("video");
          videoElement.src = url;
          videoElement.controls = true; // Ajouter les contrôles à la vidéo
          document.getElementById("show").innerHTML = ""; // Nettoyer la division avant d'ajouter la nouvelle vidéo
          document.getElementById("show").appendChild(videoElement); // Ajouter la vidéo découpée
        })
        .catch((error) => {
          console.error("Erreur lors du découpage vidéo:", error);
        });
    });
  };
  xhr.send();
}
