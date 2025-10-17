# Quiz Progress Indicator Component

## Overview

A visual progress indicator for quiz or survey applications that displays question completion status using icon states and progress dots.

## Key Features

- **Four Icon States**: DEFAULT, MOUSE OVER, INCOMPLETE, COMPLETE
- **Progress Dots**: Visual indicators showing answered vs total questions (e.g., "Answered 1/8", "Answer 3/8")
- **Conditional Display**: Progress dots only appear on mouse hover
- **Interactive Feedback**: Hover state provides visual response

## Visual Design

- **Icons**: Lightbulb with question mark in cyan/light blue
- **Backgrounds**: Dark gray (default), Black (hover), Muted gray (incomplete/complete)
- **Progress Dots**: Black (unanswered), White (answered)

## Props Interface (Suggested)

```typescript
interface QuizProgressProps {
  totalQuestions: number;
  answeredQuestions: number;
  currentState: "default" | "hover" | "incomplete" | "complete";
  showDotsOnHover?: boolean;
  onIconClick?: () => void;
  onIconHover?: () => void;
}
```

## Use Cases

- Multi-question quizzes and assessments
- Survey forms with progress tracking
- Educational applications
- Stepped workflows
