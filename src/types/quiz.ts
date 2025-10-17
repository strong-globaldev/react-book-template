export interface QuizProgressProps {
  totalQuestions: number;
  answeredQuestions: number;
  currentState?: "default" | "hover" | "incomplete" | "complete";
  showDotsOnHover?: boolean;
  onIconClick?: () => void;
  onIconHover?: () => void;
}

export type QuizState = "default" | "hover" | "incomplete" | "complete";