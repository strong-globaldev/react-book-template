interface PageIndicatorProps {
  pageNumber: number;
  className?: string;
}

export function PageIndicator({ pageNumber, className }: PageIndicatorProps) {
  const baseClasses =
    "select-none rounded-t-3xl rounded-b-none bg-black px-18 py-[42px] text-4xl font-semibold text-white shadow-xl";

  return (
    <div className={className ? `${baseClasses} ${className}` : baseClasses}>
      Page {pageNumber}
    </div>
  );
}
