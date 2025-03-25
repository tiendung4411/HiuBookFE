import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import styles from "../styles/HomeScreen.module.css";
import SummaryCarousel from "../components/SummaryCarousel";
import SearchModal from "../components/SearchModal";
import Lottie from "lottie-react";
import ReactHowler from "react-howler";
import whaleAnimation from "../assets/images/animation/Animation - 1741792766942.json";
import musicIcon from "../assets/images/pngtree-cute-little-girl-holding-a-megaphone-hand-drawn-cartoon-character-illustration-png-image_11324956-removebg-preview.png";
import {
  FaSearch,
  FaPen,
  FaBook,
  FaStar,
  FaMoon,
  FaSun,
  FaShareAlt,
  FaArrowRight,
  FaTimes
} from "react-icons/fa";

// Import ảnh minh họa cho từng lớp
import class1Mascot from "../assets/images/kids-playing.png";
import class2Mascot from "../assets/images/kids-playing.png";
import class3Mascot from "../assets/images/kids-playing.png";
import class4Mascot from "../assets/images/kids-playing.png";
import class5Mascot from "../assets/images/kids-playing.png";

// Component an toàn cho ReactHowler
class SafeReactHowler extends React.Component {
  howl = null;

  componentDidMount() {
    if (this.howl && this.props.playing) {
      this.howl.play();
    }
  }

  componentWillUnmount() {
    if (this.howl && this.howl.stop) {
      this.howl.stop();
    }
  }

  render() {
    return (
      <ReactHowler {...this.props} ref={(ref) => (this.howl = ref?.howl)} />
    );
  }
}

// Dữ liệu cho Mẹo đọc sách hay
const readingTips = [
  { id: 1, tip: "Đọc 15 phút mỗi ngày để siêu thông minh! 📚✨" },
  { id: 2, tip: "Ghi chú vui khi đọc truyện nhé! ✍️🌟" },
  { id: 3, tip: "Đọc to lên để nhớ lâu hơn nào! 🎙️🎉" }
];

// Dữ liệu bài đọc mẫu
const sampleSummaries = [
  {
    id: 1,
    image:
      "https://www.vocw.edu.vn/wp-content/uploads/2021/01/Ve-tranh-minh-hoa-truyen-co-tich-lop-8.jpg",
    title: "Truyện Cổ Tích",
    classLevel: 1
  },
  {
    id: 2,
    image:
      "https://cdnphoto.dantri.com.vn/J--UViBTDTpx6QfI4EBgU3A7yJ0=/zoom/1200_630/NxccccccccccccoFBts62NyN5Dzb54/Image/2015/02/sa1-8edd4.jpg",
    title: "Bài Học Vui",
    classLevel: 2
  },
  {
    id: 3,
    image: "https://live.staticflickr.com/7874/40474155873_8d0ac5580d_z.jpg",
    title: "Khoa Học Dễ Hiểu",
    classLevel: 3
  },
  {
    id: 4,
    image:
      "https://timviec365.vn/pictures/images_03_2021/dinh-tien-hoang%20(1).jpg",
    title: "Lịch Sử Thú Vị",
    classLevel: 4
  },
  {
    id: 5,
    image:
      "https://baovannghe.vn/stores/news_dataimages/2024/122024/20/03/truyen-co-tich-tam-cam-1280x76820241220031136.jpg?rt=20241220031138",
    title: "Văn Học Bé",
    classLevel: 5
  }
];

// Dữ liệu lớp học
const classLevels = [
  {
    id: 1,
    name: "Lớp 1",
    icon: "https://cdn.pixabay.com/photo/2016/04/15/04/19/child-1329499_1280.png",
    accessoryIcon:
      "https://cdn.pixabay.com/photo/2017/08/01/09/06/pencil-2562636_1280.png",
    mascotIcon: class1Mascot
  },
  {
    id: 2,
    name: "Lớp 2",
    icon: "https://cdn.pixabay.com/photo/2016/04/15/04/19/child-1329498_1280.png",
    accessoryIcon:
      "https://cdn.pixabay.com/photo/2017/08/01/09/06/book-2562635_1280.png",
    mascotIcon: class2Mascot
  },
  {
    id: 3,
    name: "Lớp 3",
    icon: "https://cdn.pixabay.com/photo/2016/04/15/04/19/child-1329497_1280.png",
    accessoryIcon:
      "https://cdn.pixabay.com/photo/2017/08/01/09/06/ruler-2562637_1280.png",
    mascotIcon: class3Mascot
  },
  {
    id: 4,
    name: "Lớp 4",
    icon: "https://cdn.pixabay.com/photo/2016/04/15/04/19/child-1329496_1280.png",
    accessoryIcon:
      "https://cdn.pixabay.com/photo/2017/08/01/09/06/eraser-2562638_1280.png",
    mascotIcon: class4Mascot
  },
  {
    id: 5,
    name: "Lớp 5",
    icon: "https://cdn.pixabay.com/photo/2016/04/15/04/19/child-1329495_1280.png",
    accessoryIcon:
      "https://cdn.pixabay.com/photo/2017/08/01/09/06/notebook-2562639_1280.png",
    mascotIcon: class5Mascot
  }
];

// Tin nhắn hướng dẫn
const guideMessages = [
  "Bé ơi, bay vào thế giới sách thần kỳ nào! 🚀",
  "Bé giỏi lắm, chọn sách đi nào! 😄",
  "Vào đây chọn sách yêu thích nhé! 🐳",
  "Bé ơi, đọc sách vui lắm, thử xem nào! 🌟",
  "Chú cá voi chờ bé tóm tắt sách nè! 🖋️"
];

// Dữ liệu các bước hướng dẫn
const guideSteps = [
  {
    step: 1,
    message: "Chào bé! Chú cá voi sẽ giúp bé nhé! 😊",
    icon: "🐳"
  },
  {
    step: 2,
    message: "Bé nhấn nút 'Khám phá ngay' để tìm sách nha! 🔍",
    icon: "🔍"
  },
  {
    step: 3,
    message: "Chọn lớp của bé ở đây này! 🐾",
    icon: "🐾"
  },
  {
    step: 4,
    message: "Nhấn 'Bắt đầu tóm tắt nào!' để tóm tắt sách nha! ✍️",
    icon: "✍️"
  },
  {
    step: 5,
    message: "Bé giỏi lắm! Cùng đọc sách vui nhé! 📚🎉",
    icon: "📚"
  }
];

function getRandomMessage() {
  return guideMessages[Math.floor(Math.random() * guideMessages.length)];
}

const HomeScreen = () => {
  const navigate = useNavigate();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [showGuide, setShowGuide] = useState(true);
  const [guideMessage, setGuideMessage] = useState(getRandomMessage());
  const [whalePosition, setWhalePosition] = useState(20);
  const [playSound, setPlaySound] = useState(false);
  const [jump, setJump] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [playMusic, setPlayMusic] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showGuideSteps, setShowGuideSteps] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  // Kiểm tra xem hướng dẫn đã được hiển thị chưa
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem("hasSeenGuide");
    if (hasSeenGuide) {
      setShowGuideSteps(false);
    }
  }, []);

  useEffect(() => {
    const moveWhale = setInterval(() => {
      setWhalePosition((prev) => (prev === 40 ? 80 : 40));
    }, 3000);
    return () => clearInterval(moveWhale);
  }, []);

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
    setGuideMessage("Bé ơi, bay vào thế giới sách thần kỳ nào! 🚀");
    setShowGuide(true);
  };

  const handleSummarizeClick = () => {
    navigate("/create-summary");
    setGuideMessage("Bé giỏi lắm! Chú cá voi chờ bé tóm tắt nè! 🐳");
    setShowGuide(true);
  };

  const handleClassClick = (classId) => {
    const newSelectedClass = selectedClass === classId ? null : classId;
    setSelectedClass(newSelectedClass);
    if (newSelectedClass) {
      navigate(`/reading-list/${classId}`);
      setGuideMessage(
        `Bé chọn ${
          classLevels.find((level) => level.id === classId).name
        } rồi! Chú cá voi khen bé giỏi! 🐳`
      );
      setShowGuide(true);
    }
  };

  const handleCloseModal = () => setIsSearchModalOpen(false);

  const handleGuideClick = () => {
    setGuideMessage(getRandomMessage());
    setShowGuide(true);
    setPlaySound(true);
    setJump(true);
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 500);
  };

  const toggleMusic = () => setPlayMusic(!playMusic);

  const toggleTheme = () => setIsDarkTheme(!isDarkTheme);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Tóm tắt bài đọc cho bé!",
          text: "Cùng bé khám phá thế giới sách với ứng dụng tóm tắt siêu nhanh!",
          url: window.location.href
        })
        .catch((error) => console.log("Lỗi khi chia sẻ:", error));
    } else {
      alert("Chức năng chia sẻ không được hỗ trợ trên trình duyệt này!");
    }
  };

  const handleNextStep = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowGuideSteps(false);
      localStorage.setItem("hasSeenGuide", "true");
    }
  };

  const handleSkipGuide = () => {
    setShowGuideSteps(false);
    localStorage.setItem("hasSeenGuide", "true");
  };

  return (
    <div
      className={`${styles.container} ${isDarkTheme ? styles.darkTheme : ""}`}
    >
      <Header />
      <main className={styles.mainContent}>
        {showGuideSteps && (
          <div className={styles.guideStepsContainer}>
            <div className={styles.guideStep}>
              <div className={styles.guideStepContent}>
                <Lottie
                  animationData={whaleAnimation}
                  className={styles.guideStepCharacter}
                />
                <div className={styles.guideStepMessage}>
                  <span className={styles.guideStepIcon}>
                    {guideSteps[currentStep].icon}
                  </span>
                  <p>{guideSteps[currentStep].message}</p>
                </div>
              </div>
              <div className={styles.guideStepButtons}>
                <button className={styles.skipButton} onClick={handleSkipGuide}>
                  Bỏ qua <FaTimes />
                </button>
                <button className={styles.nextButton} onClick={handleNextStep}>
                  Tiếp theo <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        )}

        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h2 className={styles.sectionTitle}>
              <FaBook className={styles.sectionIcon} /> Tóm tắt bài đọc siêu
              nhanh cho bé!
            </h2>
            <div className={styles.buttonContainer}>
              <button
                className={`${styles.exploreButton} ${
                  isSearchModalOpen ? styles.active : ""
                }`}
                onClick={handleSearchClick}
              >
                <FaSearch className={styles.buttonIcon} /> Khám phá ngay
              </button>
              <button
                className={`${styles.summaryButton}`}
                onClick={handleSummarizeClick}
              >
                <FaPen className={styles.buttonIcon} /> Bắt đầu tóm tắt nào!
              </button>
            </div>
            {summary && <p className={styles.summaryText}>{summary}</p>}
          </div>
          <div className={styles.sparkleEffect}></div>
          <div className={styles.starEffect}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className={styles.bubbleEffect}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </section>

        {showGuide && !showGuideSteps && (
          <div
            className={styles.guideContainer}
            style={{ right: `${whalePosition}px` }}
            onClick={handleGuideClick}
          >
            <SafeReactHowler
              src="/audio/beoi.mp3"
              playing={playSound}
              onEnd={() => setPlaySound(false)}
              volume={0.7}
            />
            <div className={styles.sparkleEffect}></div>
            <Lottie
              animationData={whaleAnimation}
              className={`${styles.guideCharacter} ${jump ? styles.jump : ""}`}
            />
            <div
              className={`${styles.speechBubble} ${
                isClicked ? styles.clicked : ""
              }`}
            >
              {guideMessage}
            </div>
            <button
              className={styles.closeGuide}
              onClick={() => setShowGuide(false)}
            >
              ✕
            </button>
          </div>
        )}

        <h2 className={styles.sectionTitle}>Chọn lớp của bé</h2>
        <section className={styles.classSection}>
          <div className={styles.classList}>
            <div className={styles.classRow}>
              {classLevels.slice(0, 3).map((level) => (
                <div
                  key={level.id}
                  className={`${styles.classItem} ${
                    styles[`class${level.id}`]
                  } ${selectedClass === level.id ? styles.active : ""}`}
                  onClick={() => handleClassClick(level.id)}
                >
                  <div className={styles.classIconWrapper}>
                    <img
                      src={level.mascotIcon}
                      alt={`${level.name} mascot`}
                      className={styles.classIcon}
                    />
                  </div>
                  <span>{level.name}</span>
                </div>
              ))}
            </div>
            <div className={styles.classRow}>
              {classLevels.slice(3, 5).map((level) => (
                <div
                  key={level.id}
                  className={`${styles.classItem} ${
                    styles[`class${level.id}`]
                  } ${selectedClass === level.id ? styles.active : ""}`}
                  onClick={() => handleClassClick(level.id)}
                >
                  <div className={styles.classIconWrapper}>
                    <img
                      src={level.mascotIcon}
                      alt={`${level.name} mascot`}
                      className={styles.classIcon}
                    />
                  </div>
                  <span>{level.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <h2 className={styles.sectionTitle}>
          <FaStar className={styles.sectionIcon} /> Bài đọc nổi bật
        </h2>
        <section className={styles.carouselSection}>
          <SummaryCarousel title="" items={sampleSummaries} />
        </section>

        <h2 className={styles.sectionTitle}>
          <FaBook className={styles.sectionIcon} /> Mẹo đọc sách hay
        </h2>
        <section className={styles.learningSection}>
          <div className={styles.tipList}>
            {readingTips.map((tip) => (
              <div key={tip.id} className={styles.tipItem}>
                <p>
                  <FaStar className={styles.tipIcon} /> {tip.tip}
                </p>
              </div>
            ))}
          </div>
        </section>

        <SearchModal isOpen={isSearchModalOpen} onClose={handleCloseModal} />
      </main>
    </div>
  );
};

export default HomeScreen;
