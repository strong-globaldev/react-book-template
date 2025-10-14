import { useState, useRef } from "react";
import type { AudioInteraction } from "../types/book.types";

interface AudioButtonProps {
  interaction: AudioInteraction;
}

const AudioButton = ({ interaction }: AudioButtonProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAudioPlay = async () => {
    if (isPlaying || isLoading) return;

    try {
      setIsLoading(true);
      setHasError(false);

      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio(interaction.audioFile);
        audioRef.current.volume = interaction.volume || 1.0;

        // Audio event listeners
        audioRef.current.addEventListener("loadeddata", () => {
          setIsLoading(false);
        });

        audioRef.current.addEventListener("ended", () => {
          setIsPlaying(false);
        });

        audioRef.current.addEventListener("error", () => {
          setIsLoading(false);
          setHasError(true);
        });
      }

      // Play the audio
      setIsPlaying(true);
      await audioRef.current.play();
      setIsLoading(false);
    } catch (error) {
      console.error("Audio playback failed:", error);
      setIsPlaying(false);
      setIsLoading(false);
      setHasError(true);
    }
  };

  const handleStop = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={isPlaying ? handleStop : handleAudioPlay}
      disabled={isLoading}
      className={`
        w-full h-full rounded-lg flex items-center justify-center
        transition-all duration-200 hover:scale-105
        ${
          isPlaying
            ? "bg-blue-600 bg-opacity-80 border-2 border-blue-700 animate-pulse"
            : "bg-blue-500 bg-opacity-20 hover:bg-opacity-40 border-2 border-blue-500 border-dashed"
        }
        ${hasError ? "bg-red-500 bg-opacity-20 border-red-500" : ""}
        ${isLoading ? "cursor-wait" : "cursor-pointer"}
      `}
    >
      <div className="text-center">
        {/* Icon */}
        <div className="text-2xl mb-1">
          {isLoading && <div className="animate-spin">⏳</div>}
          {hasError && !isLoading && <div>❌</div>}
          {!isLoading && !hasError && (
            <div className={isPlaying ? "animate-pulse" : ""}>
              {isPlaying ? "⏸️" : "🔊"}
            </div>
          )}
        </div>

        {/* Label */}
        {interaction.label && (
          <span
            className={`
            text-xs font-medium
            ${
              hasError
                ? "text-red-700"
                : isPlaying
                ? "text-blue-800"
                : "text-blue-700"
            }
          `}
          >
            {isLoading
              ? "Loading..."
              : hasError
              ? "Audio Error"
              : isPlaying
              ? "Playing..."
              : interaction.label}
          </span>
        )}

        {/* Default label if none provided */}
        {!interaction.label && (
          <span
            className={`
            text-xs font-medium
            ${
              hasError
                ? "text-red-700"
                : isPlaying
                ? "text-blue-800"
                : "text-blue-700"
            }
          `}
          >
            {isLoading
              ? "Loading..."
              : hasError
              ? "Error"
              : isPlaying
              ? "Playing"
              : "Play Audio"}
          </span>
        )}
      </div>
    </button>
  );
};

export default AudioButton;
