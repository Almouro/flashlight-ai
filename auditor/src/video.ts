import { Logger } from "@perf-profiler/logger";
import { exec } from "child_process";

// Define the timestamps (in milliseconds) for each step
interface Timestamp {
  start: number;
  end: number;
}

// Function to convert milliseconds to ffmpeg's time format (HH:MM:SS.milliseconds)
function msToTime(ms: number): string {
  const milliseconds = Math.floor(ms % 1000);
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(
    3,
    "0"
  )}`;
}

// Function to execute ffmpeg commands
function runFFmpegCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        reject(error);
      } else if (stderr) {
        console.error(`FFmpeg stderr: ${stderr}`);
        resolve();
      } else {
        console.log(`FFmpeg stdout: ${stdout}`);
        resolve();
      }
    });
  });
}

export const generateSubVideos = async (
  inputVideoPath: string,
  timestamps: Timestamp[]
) => {
  for (let idx = 0; idx < timestamps.length; idx++) {
    const step = timestamps[idx];
    const startTime = msToTime(step.start);
    const endTime = msToTime(step.end); // Calculate the duration

    // Define output filename
    const outputVideo = `output_step_${idx + 1}.mp4`;

    // FFmpeg command to extract sub-video
    const ffmpegCommand = `ffmpeg -i ${inputVideoPath} -ss ${startTime} -t ${endTime} -c copy ${outputVideo}`;

    // Run the FFmpeg command
    try {
      console.log(`Generating sub-video for step ${idx + 1}...`);
      Logger.success(`Running command: ${ffmpegCommand}`);
      await runFFmpegCommand(ffmpegCommand);
      console.log(`Generated sub-video: ${outputVideo}`);
    } catch (error) {
      console.error(
        `Failed to generate sub-video for step ${idx + 1}: ${error}`
      );
    }
  }
};
