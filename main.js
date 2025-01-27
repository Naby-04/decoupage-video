// Create a video player
var player = videojs("my-video");

// Activate the Video JS Trimmer plugin
player.trimmer();

// Optional: Handle event to monitor trimming changes
player.on("trimmerchange", function (event, data) {
  console.log(
    "Trimming interval changed:",
    data.startTime,
    "s -",
    data.endTime,
    "s"
  );
});
