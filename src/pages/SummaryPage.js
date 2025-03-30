import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import styles from "../styles/SummaryPage.module.css";
import * as pdfjsLib from "pdfjs-dist";
import Lottie from "lottie-react";
import whaleAnimation from "../assets/images/animation/Animation - 1741792766942.json";
import { ClipLoader } from "react-spinners";
import {
  FaArrowRight,
  FaTimes,
  FaQuestionCircle,
  FaTrash
} from "react-icons/fa";
import Confetti from "react-confetti";
import guideSteps from "../components/guideSteps";
import {
  Chart,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import {
  processPdf,
  createSummary,
  uploadImageToCloudinary
} from "../api/summaries";
import SummarySessionService from "../api/summary_sessions";

// Register Chart.js components
Chart.register(
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SummaryPage = () => {
  // State declarations
  const [selectedMethod, setSelectedMethod] = useState("extract");
  const [selectedSummaryMethod, setSelectedSummaryMethod] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(4); // Default to 4 for "extract"
  const [textInput, setTextInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [summaryResult, setSummaryResult] = useState("");
  const [summaries, setSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState("");
  const [historySummaries, setHistorySummaries] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuideSteps, setShowGuideSteps] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalSummary, setModalSummary] = useState(null);
  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser).userId : null;

  const chartRefs = {
    wordCount: useRef(null),
    keyword: useRef(null),
    sentenceLength: useRef(null),
    rouge: useRef(null),
    bleu: useRef(null),
    meteor: useRef(null),
    metrics: useRef(null)
  };
  const [charts, setCharts] = useState({});

  // Set PDF.js worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";

  // ### Event Handlers

  /** Handle method change and reset related states */
  const handleMethodChange = (newMethod) => {
    setSelectedMethod(newMethod);
    setModalSummary(null); // Reset selected summary
    setSelectedSummaryMethod(null); // Reset summary method
    setSelectedGrade(newMethod === "extract" ? 4 : 1); // Set default grade
  };

  /** Determine if a grade should be disabled based on method */
  const isGradeDisabled = (grade) => {
    const method = selectedSummaryMethod || selectedMethod;
    return method === "extract" && grade < 4; // Disable grades 1-3 for "extract"
  };

  /** Handle PDF file upload */
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") {
      setSummaries([]);
      setSelectedSummary("Ôi! Hãy chọn file PDF nha! 😅");
      setSummaryResult("Ôi! Có lỗi khi xử lý PDF nha! 😅");
      return;
    }

    try {
      const response = await processPdf(file);
      const cleanedText = response.cleanedText || "";
      setTextInput(cleanedText);
      setSummaries([]);
      setSelectedSummary("");
      setSummaryResult("");
    } catch (error) {
      setSummaries([]);
      setSelectedSummary("Ôi! Có lỗi khi xử lý PDF nha! 😅");
      setSummaryResult("Ôi! Có lỗi khi xử lý PDF nha! 😅");
      console.error("PDF processing error:", error);
    }
  };

  /** Handle image upload to Cloudinary */
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const response = await uploadImageToCloudinary(file);
        if (response.success) {
          setUploadedImage(response.imageUrl);
          setGeneratedImage(null);
        } else {
          console.error("Image upload failed:", response);
        }
      } catch (error) {
        console.error("Image upload error:", error);
      }
    }
  };

  /** Generate summary from text input */
  const handleSummary = async () => {
    if (textInput.trim() && userId) {
      setIsLoading(true);
      try {
        const response = await SummarySessionService.startSession(
          userId,
          textInput,
          selectedMethod
        );
        const summaryContent =
          response.summaryContent || "Không có nội dung tóm tắt";
        const wordCount = summaryContent.split(/\s+/).filter(Boolean).length;
        const summary = { content: summaryContent, wordCount, method: selectedMethod };

        setSummaries([summary]);
        setSelectedSummary(summary.content);
        setSummaryResult(summary.content);
        setCurrentSessionId(response.sessionId);
      } catch (error) {
        setSummaries([]);
        setSelectedSummary("Ôi! Có lỗi khi tóm tắt nha! 😅");
        setSummaryResult("Ôi! Có lỗi khi tóm tắt nha! 😅");
        console.error("Summary error:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSummaries([]);
      setSelectedSummary("Nhập gì đó để tóm tắt nha! 😄");
      setSummaryResult("Nhập gì đó để tóm tắt nha! 😄");
    }
  };

  /** Fetch summary history for the current session */
  const fetchHistorySummaries = async (sessionId) => {
    if (!userId || !sessionId) {
      setHistorySummaries([]);
      return;
    }
    try {
      const histories = await SummarySessionService.getHistoriesBySession(sessionId);
      const formattedHistories = histories.map((history) => ({
        historyId: history.historyId,
        method: history.method,
        content: history.summaryContent,
        wordCount: history.summaryContent.split(/\s+/).filter(Boolean).length,
        timestamp: history.timestamp || new Date().toLocaleString()
      }));
      setHistorySummaries(formattedHistories);
    } catch (error) {
      console.error("Error fetching session histories:", error);
      setHistorySummaries([]);
    }
  };

  const handleTextSubmit = () => handleSummary();

  /** Reset all input and output states */
  const handleReset = () => {
    setTextInput("");
    setTitleInput("");
    setSummaries([]);
    setSelectedSummary("");
    setSummaryResult("");
    setGeneratedImage(null);
    setUploadedImage(null);
    setCurrentSessionId(null);
    setHistorySummaries([]);
    setSelectedSummaryMethod(null);
  };

  /** Generate an image based on the selected summary */
  const generateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const imageData = await SummarySessionService.generateImage(selectedSummary);
      const imageUrl = imageData.imageUrl || imageData;
      setGeneratedImage(imageUrl);
      setUploadedImage(null);
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  /** Select a summary from the current session */
  const handleSelectSummary = (summary) => {
    setModalSummary(summary);
    setSelectedSummaryMethod(summary.method);
    setShowModal(true);
  };

  /** Select a summary from history */
  const handleSelectHistorySummary = (summary) => {
    setModalSummary(summary);
    setSelectedSummaryMethod(summary.method);
    setShowModal(true);
  };

  /** Submit the selected summary for review */
  const handleSubmitForReview = async () => {
    if (!modalSummary) return;

    // Validate grade compatibility
    const isValidGrade = modalSummary.method === "extract" ? selectedGrade >= 4 : true;
    if (!isValidGrade) {
      alert("Lớp học không phù hợp! Vui lòng chọn lớp 4 hoặc 5 cho phương pháp 'Trích xuất'.");
      return;
    }

    setShowModal(false);
    try {
      const summaryData = {
        title: titleInput || "Tóm tắt - " + new Date().toLocaleString(),
        content: textInput,
        summaryContent: modalSummary.content,
        status: "PENDING",
        method: modalSummary.method,
        grade: selectedGrade.toString(),
        createdBy: { userId: userId },
        imageUrl: uploadedImage || generatedImage || ""
      };

      const response = await createSummary(summaryData);
      setSelectedSummary(modalSummary.content);
      setSummaryResult(modalSummary.content);
      setSummaries([{ content: modalSummary.content, wordCount: modalSummary.wordCount, method: modalSummary.method }]);
      setShowHistory(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      alert("Bài đăng đã được gửi duyệt thành công!");
    } catch (error) {
      console.error("Error submitting for review:", error);
      alert("Gửi duyệt thất bại, vui lòng thử lại!");
    }
  };

  /** Delete a summary from history */
  const handleDeleteHistorySummary = async (historyId) => {
    if (window.confirm("Bạn có chắc muốn xóa lần tóm tắt này không?")) {
      try {
        await SummarySessionService.deleteSummaryHistory(historyId);
        await fetchHistorySummaries(currentSessionId);
      } catch (error) {
        console.error("Error deleting history:", error);
      }
    }
  };

  const handleShowHistory = () => {
    setShowHistory(true);
    if (currentSessionId) fetchHistorySummaries(currentSessionId);
  };

  // ### Chart Configuration
  const chartConfigs = {
    wordCount: {
      type: "bar",
      data: (text, summaryText) => ({
        labels: ["Văn bản gốc", "Tóm tắt"],
        datasets: [
          {
            label: "Số từ",
            data: [
              text.split(/\s+/).filter(Boolean).length,
              summaryText.split(/\s+/).filter(Boolean).length
            ],
            backgroundColor: ["#1e90ff", "#32cd32"],
            borderColor: ["#1e90ff", "#32cd32"],
            borderWidth: 2
          }
        ]
      }),
      options: (max) => ({
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: max + 20, title: { display: true, text: "Số từ" } },
          x: { title: { display: true, text: "Loại văn bản" } }
        }
      })
    }
  };

  // ### Effects
  useEffect(() => {
    setShowGuideSteps(true);
  }, [userId]);

  useEffect(() => {
    if (!summaryResult) return;

    Object.entries(charts).forEach(([key, chart]) => chart?.destroy());
    const newCharts = {};

    Object.entries(chartRefs).forEach(([key, ref]) => {
      if (ref.current && chartConfigs[key]) {
        const config = chartConfigs[key];
        const data = config.data(textInput || "", summaryResult);
        const options = config.options(Math.max(...data.datasets[0].data));
        newCharts[key] = new Chart(ref.current, {
          type: config.type,
          data,
          options: { ...options, plugins: { legend: {}, tooltip: {} } }
        });
      }
    });

    setCharts(newCharts);
  }, [summaryResult, textInput]);

  // ### Guide Handlers
  const handleShowGuideAgain = () => {
    setShowGuideSteps(true);
    setCurrentStep(0);
  };

  const handleStepInteraction = (e) => {
    const targetClass = e.target.className;
    const currentHighlight = guideSteps[currentStep].highlight;
    if (currentHighlight && currentHighlight.includes(targetClass)) handleNextStep();
  };

  const handleNextStep = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowGuideSteps(false);
    }
  };

  const handleSkipGuide = () => setShowGuideSteps(false);

  // ### Render
  return (
    <div className={styles.container} onClick={handleStepInteraction}>
      {showConfetti && <Confetti />}
      {(isLoading || isGeneratingImage) && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <ClipLoader color="#0288d1" size={100} className={styles.loadingAnimation} />
            <p className={styles.loadingMessage}>
              {isLoading ? "Đang làm việc siêu tốc nha! ⚡🌟" : "Chờ một xíu thôi nè! ⏳💖"}
            </p>
          </div>
        </div>
      )}
      <Header />
      <main className={styles.mainContent}>
        {showGuideSteps && (
          <div className={styles.guideStepsContainer}>
            <div className={styles.guideStep}>
              <div className={styles.guideStepContent}>
                <Lottie
                  animationData={whaleAnimation}
                  className={`${styles.guideStepCharacter} ${currentStep === 5 ? styles.jump : ""}`}
                />
                <div className={styles.guideStepMessage}>
                  <span className={styles.guideStepIcon}>{guideSteps[currentStep].icon}</span>
                  <p>{guideSteps[currentStep].message}</p>
                </div>
                {guideSteps[currentStep].highlight && (
                  <div
                    className={styles.highlightPointer}
                    style={{
                      display: currentStep > 1 ? "block" : "none",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      animation: "blink 1s infinite"
                    }}
                  />
                )}
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

        <div className={styles.headerContainer}>
          <div className={styles.optionColumn}>
            <div className={styles.optionSection}>
              <h3 className={styles.optionTitle}>Chọn kiểu tóm tắt 🌟</h3>
              <div className={styles.optionGroup}>
                <button
                  className={`${styles.optionButton} ${styles.methodExtract} ${
                    selectedMethod === "extract" ? styles.active : ""
                  }`}
                  onClick={() => handleMethodChange("extract")}
                  data-tooltip="Nhấn để Trích xuất văn bản! 🌊"
                >
                  <span className={styles.buttonIcon}>🌊</span> Trích xuất
                </button>
                <button
                  className={`${styles.optionButton} ${styles.methodParaphrase} ${
                    selectedMethod === "paraphrase" ? styles.active : ""
                  }`}
                  onClick={() => handleMethodChange("paraphrase")}
                  data-tooltip="Nhấn để Diễn giải văn bản! 🌴"
                >
                  <span className={styles.buttonIcon}>🌴</span> Diễn giải
                </button>
              </div>
            </div>
            <div className={styles.optionSection}>
              <h3 className={styles.optionTitle}>Chọn lớp học 🐾</h3>
              <div className={styles.optionGroup}>
                <button
                  className={`${styles.optionButton} ${styles.grade1} ${
                    selectedGrade === 1 ? styles.active : ""
                  }`}
                  onClick={() => setSelectedGrade(1)}
                  disabled={isGradeDisabled(1)}
                  data-tooltip="Chọn Lớp 1 nhé! 🐱"
                >
                  <span className={styles.buttonIcon}>🐱</span> Lớp 1
                </button>
                <button
                  className={`${styles.optionButton} ${styles.grade2} ${
                    selectedGrade === 2 ? styles.active : ""
                  }`}
                  onClick={() => setSelectedGrade(2)}
                  disabled={isGradeDisabled(2)}
                  data-tooltip="Chọn Lớp 2 nhé! 🐶"
                >
                  <span className={styles.buttonIcon}>🐶</span> Lớp 2
                </button>
                <button
                  className={`${styles.optionButton} ${styles.grade3} ${
                    selectedGrade === 3 ? styles.active : ""
                  }`}
                  onClick={() => setSelectedGrade(3)}
                  disabled={isGradeDisabled(3)}
                  data-tooltip="Chọn Lớp 3 nhé! 🐰"
                >
                  <span className={styles.buttonIcon}>🐰</span> Lớp 3
                </button>
                <button
                  className={`${styles.optionButton} ${styles.grade4} ${
                    selectedGrade === 4 ? styles.active : ""
                  }`}
                  onClick={() => setSelectedGrade(4)}
                  disabled={isGradeDisabled(4)}
                  data-tooltip="Chọn Lớp 4 nhé! 🐹"
                >
                  <span className={styles.buttonIcon}>🐹</span> Lớp 4
                </button>
                <button
                  className={`${styles.optionButton} ${styles.grade5} ${
                    selectedGrade === 5 ? styles.active : ""
                  }`}
                  onClick={() => setSelectedGrade(5)}
                  disabled={isGradeDisabled(5)}
                  data-tooltip="Chọn Lớp 5 nhé! 🐸"
                >
                  <span className={styles.buttonIcon}>🐸</span> Lớp 5
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.inputResultSection}>
          <div className={styles.titleContainer}>
            <h3 className={styles.sectionTitle}>Nhập tiêu đề cho bản tóm tắt nha! 📝</h3>
            <input
              type="text"
              className={styles.titleInput}
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Nhập tiêu đề nha! 📝"
            />
          </div>
          <div className={styles.inputResultContainer}>
            <div className={styles.textInputContainer}>
              <h3 className={styles.sectionTitle}>Nhập văn bản muốn tóm tắt nha! 😄</h3>
              <textarea
                className={styles.textArea}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Nhập văn bản muốn tóm tắt nha! 😄"
              />
              <div className={styles.buttonRow}>
                <button
                  className={`${styles.submitButton} ${isLoading ? styles.loading : ""}`}
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim() || isLoading}
                >
                  Tóm tắt nào! 🌈
                </button>
                <label htmlFor="file-upload" className={styles.uploadButton}>
                  Tải PDF 📄
                  <input
                    type="file"
                    id="file-upload"
                    className={styles.fileInput}
                    onChange={handleFileUpload}
                    accept=".pdf"
                  />
                </label>
                <button className={styles.resetButton} onClick={handleReset}>
                  Xóa hết 🧹
                </button>
              </div>
            </div>

            <div className={styles.resultContainer}>
              {!showHistory ? (
                <>
                  <h3 className={styles.sectionTitle}>Kết quả tóm tắt đây nha! 🎉</h3>
                  <div className={styles.resultBox}>
                    <p className={styles.resultText}>
                      {selectedSummary || "Chưa có kết quả! Tóm tắt để xem nha! 😊"}
                    </p>
                  </div>
                  {summaries.length > 0 && (
                    <div className={styles.summaryOptionsContainer}>
                      <h3 className={styles.sectionTitle}>Bản tóm tắt mới nhất 🌟</h3>
                      <div className={styles.summaryOptions}>
                        {summaries.map((summary, index) => (
                          <div
                            key={index}
                            className={`${styles.summaryOption} ${
                              selectedSummary === summary.content ? styles.selected : ""
                            }`}
                            onClick={() => handleSelectSummary(summary)}
                          >
                            <p className={styles.summaryOptionTitle}>
                              Bản tóm tắt ({summary.wordCount} từ) 📜
                            </p>
                            <button className={styles.selectSummaryButton}>
                              Chọn bản này! ✅
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h3 className={styles.sectionTitle}>Lịch sử tóm tắt của phiên này! 🕒</h3>
                  {currentSessionId ? (
                    historySummaries.length > 0 ? (
                      <div className={styles.historyContainer}>
                        <div className={styles.sessionGroup}>
                          <div className={styles.historyHeader}>
                            <p className={styles.historyTimestamp}>
                              Phiên {currentSessionId} ({historySummaries[0].timestamp})
                            </p>
                          </div>
                          {historySummaries.map((history) => (
                            <div key={history.historyId} className={styles.historyItem}>
                              <div className={styles.historySummaryOptions}>
                                <div
                                  className={`${styles.summaryOption} ${
                                    selectedSummary === history.content ? styles.selected : ""
                                  }`}
                                  onClick={() => handleSelectHistorySummary(history)}
                                >
                                  <p className={styles.summaryOptionTitle}>
                                    Bản tóm tắt ({history.wordCount} từ) - {history.method} 📜
                                  </p>
                                  <button className={styles.selectSummaryButton}>
                                    Chọn bản này! ✅
                                  </button>
                                </div>
                              </div>
                              <button
                                className={styles.deleteHistoryButton}
                                onClick={() => handleDeleteHistorySummary(history.historyId)}
                                title="Xóa lần tóm tắt này"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className={styles.resultText}>
                        Chưa có lịch sử tóm tắt nào cho phiên này! 😊
                      </p>
                    )
                  ) : (
                    <p className={styles.resultText}>
                      Vui lòng tóm tắt để xem lịch sử của phiên! 😊
                    </p>
                  )}
                </>
              )}
              <div className={styles.tabButtons}>
                <button
                  className={`${styles.tabButton} ${!showHistory ? styles.activeTab : ""}`}
                  onClick={() => setShowHistory(false)}
                >
                  Tóm tắt hiện tại 📝
                </button>
                <button
                  className={`${styles.tabButton} ${showHistory ? styles.activeTab : ""}`}
                  onClick={handleShowHistory}
                >
                  Xem lịch sử 🕒
                </button>
              </div>
              {selectedSummary && (
                <div className={styles.imageActionButtons}>
                  <button
                    className={styles.generateImageButton}
                    onClick={() => {
                      if (window.confirm("Bạn muốn tạo hình ảnh bằng AI dựa trên bản tóm tắt này?")) {
                        generateImage();
                      }
                    }}
                    disabled={isGeneratingImage}
                  >
                    Tạo ảnh bằng AI 🎨
                  </button>
                  <label htmlFor="image-upload" className={styles.uploadImageButton}>
                    Upload hình ảnh 🖼️
                    <input
                      type="file"
                      id="image-upload"
                      className={styles.fileInput}
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                  </label>
                </div>
              )}
              {(generatedImage || uploadedImage) && (
                <div className={styles.imageContainer}>
                  <h3 className={styles.sectionTitle}>Hình ảnh của bạn:</h3>
                  <img
                    src={generatedImage || uploadedImage}
                    alt="Hình ảnh"
                    className={styles.displayedImage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3>Bạn muốn gửi duyệt bài đăng này à?</h3>
              <p>{modalSummary?.content}</p>
              <div className={styles.modalButtons}>
                <button className={styles.modalCancelButton} onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button className={styles.modalSubmitButton} onClick={handleSubmitForReview}>
                  Gửi duyệt
                </button>
              </div>
            </div>
          </div>
        )}

        {!showGuideSteps && (
          <button
            className={styles.showGuideButton}
            onClick={handleShowGuideAgain}
            title="Xem lại hướng dẫn"
          >
            <FaQuestionCircle />
          </button>
        )}
      </main>
    </div>
  );
};

export default SummaryPage;