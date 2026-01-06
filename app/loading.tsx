export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 z-50">
      <div className="flex flex-col items-center">
        {/* スピナー部分 */}
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600"></div>
        
        {/* テキスト部分 */}
        <p className="mt-4 text-gray-600 font-semibold animate-pulse">Loading...</p>
      </div>
    </div>
  );
}