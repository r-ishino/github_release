type HeaderProps = {
  login: string | null;
};

export const Header = ({ login }: HeaderProps) => {
  return (
    <header className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">GitHub Release Manager</h1>
        {login && (
          <div className="flex items-center gap-3 text-sm">
            <span>{login}</span>
            <form method="post" action="/api/auth/logout">
              <button
                type="submit"
                className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-800"
              >
                ログアウト
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};
