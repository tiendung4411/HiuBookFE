import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import styles from "../styles/ReadingListPage.module.css";
import {
  FaBook,
  FaSearch,
  FaShareAlt,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaArrowLeft, // Đảm bảo import FaArrowLeft
  FaArrowRight,
  FaMagic
} from "react-icons/fa"; // Thêm lại FaArrowLeft để sử dụng trong pagination
import { motion, AnimatePresence } from "framer-motion";

// Import API functions
import {
  getSummariesByGrade,
  getSummariesByContributor
} from "../api/summaries"; // Assuming your summaries API is in this file

// Placeholder image nếu hình ảnh không tải được
const placeholderImage =
  "https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/02/truyen-co-tich-thumb.jpg";

  const ReadingListPage = () => {
    const { classLevel } = useParams();
    const level = parseInt(classLevel, 10);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [genreFilter, setGenreFilter] = useState("Tất cả");
    const [difficultyFilter, setDifficultyFilter] = useState("Tất cả");
    const [lengthFilter, setLengthFilter] = useState("Tất cả");
    const [sortOrder, setSortOrder] = useState("A-Z");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
  
    const [summaries, setSummaries] = useState([]); // Store fetched summaries
    const [randomStory, setRandomStory] = useState(null); // Random story state
  
    // Fetch summaries when classLevel is available
    useEffect(() => {
      const fetchSummaries = async () => {
        try {
          const response = await getSummariesByGrade(level);
          console.log("Fetched summaries:", response.data); // Log the data
          setSummaries(response.data); // Set the summaries state
        } catch (error) {
          console.error("Error fetching summaries:", error);
        }
      };
  
      fetchSummaries();
    }, [level]);
  
    // Filter summaries based on user inputs
    const filteredSummaries = summaries
      .filter((item) => 
        (genreFilter === "Tất cả" || item.genre === genreFilter) &&
        (difficultyFilter === "Tất cả" || item.difficulty === difficultyFilter) &&
        (lengthFilter === "Tất cả" || item.length === lengthFilter) &&
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
    // Sort summaries alphabetically based on the selected sort order
    const sortedSummaries = [...filteredSummaries].sort((a, b) => {
      if (sortOrder === "A-Z") {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
  
    // Pagination logic
    const totalPages = Math.ceil(sortedSummaries.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedSummaries = sortedSummaries.slice(startIndex, startIndex + itemsPerPage);
  
    const handleSearch = (event) => {
      setSearchTerm(event.target.value);
      setCurrentPage(1);
      setRandomStory(null); // Reset random story when searching
    };
  
    const handleGenreFilter = (event) => {
      setGenreFilter(event.target.value);
      setCurrentPage(1);
      setRandomStory(null); // Reset random story when filtering
    };
  
    const handleDifficultyFilter = (event) => {
      setDifficultyFilter(event.target.value);
      setCurrentPage(1);
      setRandomStory(null); // Reset random story when filtering
    };
  
    const handleLengthFilter = (event) => {
      setLengthFilter(event.target.value);
      setCurrentPage(1);
      setRandomStory(null); // Reset random story when filtering
    };
  
    const handleSortOrder = () => {
      setSortOrder(sortOrder === "A-Z" ? "Z-A" : "A-Z");
      setCurrentPage(1);
      setRandomStory(null); // Reset random story when sorting
    };
  
    const handleShare = (story) => {
      if (navigator.share) {
        navigator
          .share({
            title: story.title,
            text: story.description,
            url: window.location.href
          })
          .catch((error) => console.log("Lỗi khi chia sẻ:", error));
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Liên kết đã được sao chép!");
      }
    };
  
    const handleReadNow = (storyId) => {
      navigate(`/story/${storyId}`);
    };
  
    const goToPreviousPage = () => {
      if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
  
    const goToNextPage = () => {
      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
  
    // Select random story from filtered list
    const handleRandomStory = () => {
      const availableStories = filteredSummaries.filter(
        (item) => !randomStory || item.summaryId !== randomStory.summaryId
      );
      if (availableStories.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableStories.length);
        setRandomStory(availableStories[randomIndex]);
        setTimeout(() => setRandomStory(null), 5000); // Hide random story after 5 seconds
      }
    };
  
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.navBar}>
          <h2 className={styles.navTitle}>Danh sách bài đọc cho Lớp {classLevel}</h2>
          <button onClick={handleRandomStory} className={styles.randomButton}>
            <FaMagic className={styles.randomIcon} /> Khám phá ngẫu nhiên
          </button>
        </div>
        <div className={styles.filterSearchContainer}>
         
          <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm bài đọc..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>
          <button onClick={handleSortOrder} className={styles.sortButton}>
            {sortOrder === "A-Z" ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
            Sắp xếp
          </button>
        </div>
        <main className={styles.mainContent}>
          <section className={styles.readingListSection}>
            <div className={styles.readingList}>
              <AnimatePresence>
                {randomStory && (
                  <motion.div
                    className={styles.randomStory}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className={styles.randomTitle}>Gợi ý ngẫu nhiên: {randomStory.title}</h3>
                    <p className={styles.randomDescription}>{randomStory.description}</p>
                    <button onClick={() => handleReadNow(randomStory.summaryId)} className={styles.readButton}>Đọc ngay</button>
                  </motion.div>
                )}
                {paginatedSummaries.length > 0 ? (
                  paginatedSummaries.map((item) => (
                    <motion.div
                      key={item.summaryId}
                      className={styles.readingItem}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <img
                        src={item.imageUrl || placeholderImage}
                        alt={item.title}
                        className={styles.readingImage}
                        onError={(e) => (e.target.src = placeholderImage)}
                      />
                      <div className={styles.readingDetails}>
                        <div className={styles.titleActions}>
                          <h3 className={styles.readingTitle}>{item.title}</h3>
                          <div className={styles.actions}>
                            <button
                              onClick={() => handleShare(item)}
                              className={styles.actionButton}
                              title="Chia sẻ bài đọc"
                            >
                              <FaShareAlt />
                            </button>
                          </div>
                        </div>
                        <p className={styles.readingDescription}>{item.description}</p>
                        <button onClick={() => handleReadNow(item.summaryId)} className={styles.readButton}>Đọc ngay</button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.p
                    className={styles.noItems}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Không có bài đọc nào phù hợp.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button onClick={goToPreviousPage} disabled={currentPage === 1} className={styles.paginationButton}>
                  Trước
                </button>
                <span className={styles.paginationText}>Trang {currentPage} / {totalPages}</span>
                <button onClick={goToNextPage} disabled={currentPage === totalPages} className={styles.paginationButton}>
                  Tiếp <FaArrowRight />
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    );
  };
  
  export default ReadingListPage;