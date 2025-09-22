interface PunchButtonProps {
  type: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export default function PunchButton({ 
  type, 
  onClick, 
  disabled = false, 
  className = "" 
}: PunchButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-4 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg ${className} ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`}
    >
      {disabled ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>処理中...</span>
        </div>
      ) : (
        type
      )}
    </button>
  );
}
