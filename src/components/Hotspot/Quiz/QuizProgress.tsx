import { useState } from 'react';
import type { QuizProgressProps } from '../../../types';

const QuizProgress = ({
  totalQuestions,
  answeredQuestions,
  currentState = "default",
  showDotsOnHover = true,
  onIconClick,
  onIconHover
}: QuizProgressProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [internalState, setInternalState] = useState(currentState);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setInternalState("hover");
    onIconHover?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setInternalState(determineState());
  };

  const handleClick = () => {
    onIconClick?.();
  };

  const determineState = () => {
    if (answeredQuestions === 0) return "default";
    if (answeredQuestions === totalQuestions) return "complete";
    return "incomplete";
  };

  const getBackgroundColor = () => {
    switch (internalState) {
      case "hover":
        return "bg-black";
      case "incomplete":
      case "complete":
        return "bg-gray-500";
      default:
        return "bg-gray-700";
    }
  };

  const getIconColor = () => {
    return "text-cyan-400";
  };

  const renderProgressDots = () => {
    if (!showDotsOnHover || !isHovered) return null;

    return (
      <div className="flex gap-1 mt-2">
        {Array.from({ length: totalQuestions }, (_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index < answeredQuestions ? 'bg-white' : 'bg-black border border-white'
            }`}
          />
        ))}
      </div>
    );
  };

  const LightbulbIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${getIconColor()}`}
    >
      <path
        d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.2 3-3.3 3-5.7 0-3.9-3.1-7-7-7z"
        fill="currentColor"
      />
      <text
        x="12"
        y="14"
        textAnchor="middle"
        fontSize="8"
        fill="currentColor"
        fontWeight="bold"
      >
        ?
      </text>
    </svg>
  );

  return (
    <div className="inline-flex flex-col items-center">
      <div
        className={`
          ${getBackgroundColor()} 
          rounded-lg p-3 cursor-pointer transition-colors duration-200
          flex items-center justify-center
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <LightbulbIcon />
      </div>
      
      {renderProgressDots()}
      
      {isHovered && (
        <div className="mt-1 text-xs text-white">
          Answered {answeredQuestions}/{totalQuestions}
        </div>
      )}
    </div>
  );
};

export default QuizProgress;