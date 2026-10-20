import './App.css';
import React, { useState } from 'react';

function App() {
  // 2. State Tracking Architecture
  const [items, updateItems] = useState([]);
  const [input, updateInput] = useState({
    textquery: 'stars, galaxies and the universe'
  });

  // Immutable State Updates
  function updateInputValues(type, value) {
    updateInput({ ...input, [type]: value });
  }

  // 3. Remote Server Communication
  async function queryTable() {
    const { textquery } = input;
    if (!textquery) return;

    try {
      const endpoint = `https://ypb1qnjsk1.execute-api.us-east-2.amazonaws.com/api/movies/test?textquery=${encodeURIComponent(textquery)}`;
      const response = await fetch(endpoint);
      const data = await response.json();
      
      // If your Lambda returns a direct list, or wraps inside a body string:
      const parsedItems = typeof data === 'string' ? JSON.parse(data) : (data.body ? JSON.parse(data.body) : data);
      updateItems(Array.isArray(parsedItems) ? parsedItems : []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }

  // Helper to format seconds to "Xh Ym"
  function formatRuntime(seconds) {
    if (!seconds) return '0h 0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  }

  return (
    <div className="container">
      {/* 4. Form Inputs & Event Bindings */}
      <header className="header">
        <h1>Semantic Search for Movies</h1>
        <p className="subtitle">Find movies by describing the plot or mood...</p>

        <div className="search-bar">
          <input
            type="text"
            className="myInput"
            value={input.textquery}
            placeholder="Describe plot or mood..."
            onChange={(e) => updateInputValues('textquery', e.target.value)}
          />
          <button className="search-btn" onClick={queryTable}>
            Search
          </button>
        </div>
      </header>

      {/* 5. Rendering Dynamic Collections */}
      <main className="collection-section">
        <h2>Movie Collection</h2>

        <div className="movie-grid">
          {items.map((entry, index) => {
            const movie = entry.movie || entry;
            const info = movie.info || {};
            const actors = Array.isArray(info.actors) ? info.actors.join(', ') : 'N/A';
            const directors = Array.isArray(info.directors) ? info.directors.join(', ') : 'N/A';
            const genres = Array.isArray(info.genres) ? info.genres.join(', ') : '';

            return (
              <div key={index} className="movie-card">
                <div className="movie-header">
                  <span className="movie-title">
                    {movie.title} {movie.year ? `(${movie.year})` : ''}
                  </span>
                  <span className="rating-badge">{info.rating ?? 'N/A'}</span>
                </div>

                <div className="movie-meta">
                  <span>{formatRuntime(info.running_time_secs)}</span>
                  {genres && <span> • {genres}</span>}
                </div>

                <p className="movie-plot">{info.plot || 'No plot summary available.'}</p>

                <div className="movie-credits">
                  <div><strong>Director:</strong> {directors}</div>
                  <div><strong>Starring:</strong> {actors}</div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default App;