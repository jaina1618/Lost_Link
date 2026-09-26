export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-600 to-accent flex items-center justify-center animate-pulse-slow">
          <span className="text-2xl">🔗</span>
        </div>
        <div className="flex gap-1.5 justify-center mt-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
