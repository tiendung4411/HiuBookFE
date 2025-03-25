import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { searchSummariesByTitle } from "../api/summaries";
import styles from "../styles/SearchModal.module.css";
import debounce from "lodash/debounce";
import { FaTimes } from "react-icons/fa";

const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(""); // Lọc theo lớp
  const navigate = useNavigate();

  // Danh sách lớp học
  const classOptions = [
    { value: "", label: "Tất cả lớp" },
    { value: "1", label: "Lớp 1" },
    { value: "2", label: "Lớp 2" },
    { value: "3", label: "Lớp 3" },
    { value: "4", label: "Lớp 4" },
    { value: "5", label: "Lớp 5" }
  ];

  // Reset trạng thái khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setIsLoading(false);
      setSelectedClass("");
    }
  }, [isOpen]);

  // Hàm tìm kiếm với debounce
  const handleSearch = useCallback(
    debounce(async (query, classLevel) => {
      if (query.trim() === "") {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await searchSummariesByTitle(query);
        if (Array.isArray(response.data)) {
          let filteredResults = response.data;
          if (classLevel) {
            filteredResults = response.data.filter(
              (result) => result.classLevel === parseInt(classLevel)
            );
          }
          setSearchResults(filteredResults);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  // Gọi tìm kiếm khi nhập từ khóa hoặc thay đổi lớp
  useEffect(() => {
    handleSearch(searchQuery, selectedClass);
  }, [searchQuery, selectedClass, handleSearch]);

  const handleResultClick = (id) => {
    navigate(`/story/${id}`);
    onClose();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  if (!isOpen || typeof isOpen !== "boolean") return null;

  return (
    <div className={`${styles.modal} ${isOpen ? styles.open : ""}`}>
      <div className={styles.modalContent}>
        <h2>Tìm kiếm sách nào bé ơi!</h2>
        <div className={styles.searchContainer}>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nhập từ khóa..."
            className={styles.searchInput}
          />
          {searchQuery && (
            <button className={styles.clearButton} onClick={handleClearSearch}>
              <FaTimes />
            </button>
          )}
        </div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className={styles.classFilter}
        >
          {classOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className={styles.buttonGroup}>
          <button
            className={styles.searchButton}
            onClick={() => handleSearch(searchQuery, selectedClass)}
          >
            Tìm kiếm
          </button>
          <button className={styles.closeButton} onClick={onClose}>
            Đóng
          </button>
        </div>

        {isLoading ? (
          <p className={styles.loading}>Đang tìm kiếm...</p>
        ) : searchResults.length > 0 ? (
          <div className={styles.results}>
            <p className={styles.resultCount}>
              Tìm thấy {searchResults.length} kết quả
            </p>
            <ul>
              {searchResults.map((result) => (
                <li
                  key={result.summaryId}
                  onClick={() => handleResultClick(result.summaryId)}
                  className={styles.resultItem}
                >
                  {result.title}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className={styles.noResults}>
            Không tìm thấy kết quả phù hợp. Hãy thử lại với từ khóa khác!
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
