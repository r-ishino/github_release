export const LoginPrompt = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-center">
      <p className="text-gray-600 mb-6">
        GitHub
        アカウントでログインすると、書き込み権限のあるリポジトリのリリースを作成できます。
      </p>
      <a
        href="/api/auth/login"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        GitHub でログイン
      </a>
    </div>
  );
};
