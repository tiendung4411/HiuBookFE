import React, { useState } from 'react';
import { searchSummariesByTitle } from '../api/summaries'; // Import the API function
import { useNavigate } from 'react-router-dom';
import styles from '../styles/SearchModal.module.css';

const SearchModal = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();

    const handleSearch = async () => {
        console.log('Search query:', searchQuery);
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }

        try {
            const response = await searchSummariesByTitle(searchQuery); // Call the search function
            setSearchResults(response.data);
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    };

    const handleResultClick = (id) => {
        navigate(`/story/${id}`); // Navigate to the specific summary page
    };

    return (
        <div className={`${styles.modal} ${isOpen ? styles.open : ''}`}>
            <div className={styles.modalContent}>
                <h2>Tìm kiếm tóm tắt</h2>
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nhập từ khóa..."
                    className={styles.searchInput}
                />
                <button className={styles.searchButton} onClick={handleSearch}>
                    Tìm kiếm
                </button>
                <button className={styles.closeButton} onClick={onClose}>
                    Đóng
                </button>

                {searchResults.length > 0 ? (
                    <div className={styles.results}>
                        <ul>
                            {searchResults.map((result) => (
                                <li
                                    key={result.summaryId}
                                    onClick={() => handleResultClick(result.summaryId)} // Navigate on click
                                    className={styles.resultItem}
                                >
                                    {result.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className={styles.noResults}>Không tìm thấy kết quả phù hợp. Hãy thử lại với từ khóa khác!</p>
                )}
            </div>
        </div>
    );
};

export default SearchModal;
