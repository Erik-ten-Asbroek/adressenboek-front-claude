export function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Contacten zoeken..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="search-clear"
          aria-label="Zoekopdracht wissen"
        >
          &times;
        </button>
      )}
    </div>
  );
}

export default SearchBar;
