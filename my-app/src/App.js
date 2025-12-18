import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';

const API_KEY = '53654899-cf708ca7bc97f05663599702a';

function Searchbar({ onSubmit }) {
  const [inputValue, setInputValue] = useState('');

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <header className="searchbar">
      <form className="form" onSubmit={handleSubmit}>
        <button type="submit" className="button">
          <span className="button-label">Search</span>
        </button>
        <input
          className="input"
          type="text"
          autoComplete="off"
          autoFocus
          placeholder="Search images and photos"
          value={inputValue}
          onChange={handleChange}
        />
      </form>
    </header>
  );
}

function ImageGalleryItem({ src, onClick }) {
  return (
    <li className="gallery-item" onClick={onClick}>
      <img src={src} alt="" />
    </li>
  );
}

function ImageGallery({ images, onItemClick }) {
  return (
    <ul className="gallery">
      {images.map(({ id, webformatURL, largeImageURL }) => (
        <ImageGalleryItem
          key={id}
          src={webformatURL}
          onClick={() => onItemClick(largeImageURL)}
        />
      ))}
    </ul>
  );
}

function Loader() {
  return (
    <div className="loader">
      Loading...
    </div>
  );
}

function Button({ onClick }) {
  return (
    <button className="load-more" onClick={onClick}>
      Load more
    </button>
  );
}

function Modal({ largeImageURL, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.currentTarget === e.target) {
      onClose();
    }
  };

  return (
    <div className="overlay" onClick={handleBackdropClick}>
      <div className="modal">
        <img src={largeImageURL} alt="" />
      </div>
    </div>
  );
}

function App() {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [largeImage, setLargeImage] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const requestUrl = useMemo(() => {
    if (!query) return null;

    return `https://pixabay.com/api/?q=${encodeURIComponent(
      query
    )}&page=${page}&key=${API_KEY}&image_type=photo&orientation=horizontal&per_page=12`;
  }, [query, page]);

  const fetchImages = useCallback(async () => {
    if (!requestUrl) return;

    try {
      setLoading(true);
      const response = await fetch(requestUrl);
      const data = await response.json();

      setImages(prev =>
        page === 1 ? data.hits || [] : [...prev, ...(data.hits || [])]
      );
      setHasMore((data.hits || []).length === 12);
    } catch (err) {
      console.error('Error fetching:', err);
    } finally {
      setLoading(false);
    }
  }, [requestUrl, page]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleSearchSubmit = useCallback(word => {
    if (word === query) return; // Prevent re-fetch if same query
    setQuery(word);
    setImages([]);
    setPage(1);
    setHasMore(false);
  }, [query]);

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const openModal = useCallback(url => {
    setLargeImage(url);
  }, []);

  const closeModal = useCallback(() => {
    setLargeImage(null);
  }, []);

  return (
    <>
      <Searchbar onSubmit={handleSearchSubmit} />

      {images.length > 0 && <ImageGallery images={images} onItemClick={openModal} />}

      {loading && <Loader />}

      {hasMore && !loading && (
        <Button onClick={loadMore} />
      )}

      {largeImage && (
        <Modal largeImageURL={largeImage} onClose={closeModal} />
      )}
    </>
  );
}

export default App;