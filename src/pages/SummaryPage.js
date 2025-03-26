import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import styles from "../styles/SummaryPage.module.css";
import * as pdfjsLib from "pdfjs-dist";
import Lottie from "lottie-react";
import whaleAnimation from "../assets/images/animation/Animation - 1741792766942.json";
import {
  FaArrowRight,
  FaTimes,
  FaQuestionCircle,
  FaTrash,
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
  Legend,
} from "chart.js";
import { processPdf } from "../api/summaries";
import SummarySessionService from "../api/summary_sessions";

// Register Chart.js components
Chart.register(BarController, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SummaryPage = () => {
  const [selectedMethod, setSelectedMethod] = useState("extract");
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [textInput, setTextInput] = useState("");
  const [summaryResult, setSummaryResult] = useState("");
  const [summaries, setSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState("");
  const [historySummaries, setHistorySummaries] = useState([]); // Histories for the current session
  const [currentSessionId, setCurrentSessionId] = useState(null); // Track the current session
  const [showHistory, setShowHistory] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuideSteps, setShowGuideSteps] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [expandedChart, setExpandedChart] = useState(null);
  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser).userId : null;

  const chartRefs = {
    wordCount: useRef(null),
    keyword: useRef(null),
    sentenceLength: useRef(null),
    rouge: useRef(null),
    bleu: useRef(null),
    meteor: useRef(null),
    metrics: useRef(null),
  };
  const [charts, setCharts] = useState({});

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";

  const handleMethodChange = (newMethod) => {
    setSelectedMethod(newMethod);
    if (newMethod === "extract" && selectedGrade < 4) setSelectedGrade(4);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") {
      setSummaries([]);
      setSelectedSummary("Ôi! Hãy chọn file PDF nha! 😅");
      setSummaryResult("Ôi! Hãy chọn file PDF nha! 😅");
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

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Ôi! Hãy chọn file hình ảnh nha! 😅");
    }
  };

  const handleSummary = async () => {
    if (textInput.trim() && userId) {
      setIsLoading(true);
      try {
        const response = await SummarySessionService.startSession(userId, textInput, selectedMethod);
        console.log("Start session response:", response); // Debug log
        const summaryContent = response.summaryContent || "Không có nội dung tóm tắt";
        const wordCount = summaryContent.split(/\s+/).filter(Boolean).length;
        const summary = { content: summaryContent, wordCount };

        setSummaries([summary]);
        setSelectedSummary(summary.content);
        setSummaryResult(summary.content);
        setCurrentSessionId(response.sessionId); // Set the current session ID
        console.log("Current session ID set to:", response.sessionId); // Debug log
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

  const fetchHistorySummaries = async (sessionId) => {
    console.log("Fetching histories for session:", sessionId); // Debug log
    if (!userId || !sessionId) {
      console.log("Missing userId or sessionId:", { userId, sessionId });
      setHistorySummaries([]);
      return;
    }
    try {
      const histories = await SummarySessionService.getHistoriesBySession(sessionId);
      console.log("Histories fetched:", histories); // Debug log
      const formattedHistories = histories.map(history => ({
        historyId: history.historyId,
        method: history.method,
        content: history.summaryContent,
        wordCount: history.summaryContent.split(/\s+/).filter(Boolean).length,
        timestamp: history.timestamp || new Date().toLocaleString(),
      }));
      setHistorySummaries(formattedHistories);
    } catch (error) {
      console.error("Error fetching session histories:", error);
      setHistorySummaries([]);
    }
  };

  const handleTextSubmit = () => {
    handleSummary();
  };

  const handleReset = () => {
    setTextInput("");
    setSummaries([]);
    setSelectedSummary("");
    setSummaryResult("");
    setGeneratedImage(null);
    setUploadedImage(null);
    setCurrentSessionId(null);
    setHistorySummaries([]);
  };

  const generateImage = async () => {
    if (selectedSummary) {
      if (window.confirm("Bạn muốn tạo hình ảnh bằng AI dựa trên bản tóm tắt này?")) {
        setIsGeneratingImage(true);
        try {
          const imageData = await SummarySessionService.generateImage(selectedSummary);
          const imageUrl = imageData.imageUrl || imageData;
          setGeneratedImage(imageUrl);
          setUploadedImage(null);
          alert("Hình ảnh đã được tạo thành công! 🎨");
        } catch (error) {
          alert("Ôi! Có lỗi khi tạo ảnh nha! 😅");
          console.error("Error generating image:", error);
        } finally {
          setIsGeneratingImage(false);
        }
      }
    } else {
      alert("Vui lòng tóm tắt trước khi tạo hình ảnh!");
    }
  };

  const handleSelectSummary = (summary) => {
    setSelectedSummary(summary.content);
    setSummaryResult(summary.content);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleSelectHistorySummary = (summary) => {
    if (!summary || !summary.content) {
      console.error("Invalid summary object:", summary);
      alert("Ôi! Bản tóm tắt này không hợp lệ! 😅");
      return;
    }
    setSelectedSummary(summary.content);
    setSummaryResult(summary.content);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000); 
    setShowHistory(false);
  };

  const handleDeleteHistorySummary = async (historyId) => {
    if (window.confirm("Bạn có chắc muốn xóa lần tóm tắt này không?")) {
      try {
        await SummarySessionService.deleteSummaryHistory(historyId);
        await fetchHistorySummaries(currentSessionId); // Refresh history after deletion
        alert("Đã xóa lần tóm tắt này! 🗑️");
      } catch (error) {
        console.error("Error deleting history:", error);
        alert("Ôi! Có lỗi khi xóa lịch sử! 😅");
      }
    }
  };

  const handleShowHistory = () => {
    setShowHistory(true);
    if (currentSessionId) {
      fetchHistorySummaries(currentSessionId); // Fetch histories when tab is clicked
    }
  };

  const toggleChart = (chartId) => {
    setExpandedChart(expandedChart === chartId ? null : chartId);
  };

  const chartConfigs = {
    wordCount: {
      type: "bar",
      data: (text, summaryText) => ({
        labels: ["Văn bản gốc", "Tóm tắt"],
        datasets: [
          {
            label: "Số từ",
            data: [text.split(/\s+/).filter(Boolean).length, summaryText.split(/\s+/).filter(Boolean).length],
            backgroundColor: ["#1e90ff", "#32cd32"],
            borderColor: ["#1e90ff", "#32cd32"],
            borderWidth: 2,
          },
        ],
      }),
      options: (max) => ({
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: max + 20, title: { display: true, text: "Số từ" } },
          x: { title: { display: true, text: "Loại văn bản" } },
        },
      }),
    },
  };

  useEffect(() => {
    setShowGuideSteps(true);
    // Don’t fetch histories on mount; wait for "Xem lịch sử" button
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
          options: { ...options, plugins: { legend: {}, tooltip: {} } },
        });
      }
    });

    setCharts(newCharts);
  }, [summaryResult, textInput]);

  const handleShowGuideAgain = () => {
    setShowGuideSteps(true);
    setCurrentStep(0);
  };

  const handleStepInteraction = (e) => {
    const targetClass = e.target.className;
    const currentHighlight = guideSteps[currentStep].highlight;
    if (currentHighlight && currentHighlight.includes(targetClass)) {
      handleNextStep();
    }
  };

  const handleNextStep = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowGuideSteps(false);
    }
  };

  const handleSkipGuide = () => {
    setShowGuideSteps(false);
  };

  return (
    <div className={styles.container} onClick={handleStepInteraction}>
      {showConfetti && <Confetti />}
      <Header />
      <main className={styles.mainContent}>
        {showGuideSteps && (
          <div className={styles.guideStepsContainer}>
            <div className={styles.guideStep}>
              <div className={styles.guideStepContent}>
                <Lottie
                  animationData={whaleAnimation}
                  className={`${styles.guideStepCharacter} ${
                    currentStep === 5 ? styles.jump : ""
                  }`}
                />
                <div className={styles.guideStepMessage}>
                  <span className={styles.guideStepIcon}>
                    {guideSteps[currentStep].icon}
                  </span>
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
                      animation: "blink 1s infinite",
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
                  className={`${styles.optionButton} ${
                    styles.methodParaphrase
                  } ${selectedMethod === "paraphrase" ? styles.active : ""}`}
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
                  disabled={selectedMethod === "extract" && 1 < 4}
                  data-tooltip="Chọn Lớp 1 nhé! 🐱"
                >
                  <span className={styles.buttonIcon}>🐱</span> Lớp 1
                </button>
                <button
                  className={`${styles.optionButton} ${styles.grade2} ${
                    selectedGrade === 2 ? styles.active : ""
                  }`}
                  onClick={() => setSelectedGrade(2)}
                  disabled={selectedMethod === "extract" && 2 < 4}
                  data-tooltip="Chọn Lớp 2 nhé! 🐶"
                >
                  <span className={styles.buttonIcon}>🐶</span> Lớp 2
                </button>
                <button
                  className={`${styles.optionButton} ${styles.grade3} ${
                    selectedGrade === 3 ? styles.active : ""
                  }`}
                  onClick={() => setSelectedGrade(3)}
                  disabled={selectedMethod === "extract" && 3 < 4}
                  data-tooltip="Chọn Lớp 3 nhé! 🐰"
                >
                  <span className={styles.buttonIcon}>🐰</span> Lớp 3
                </button>
                <button
                  className={`${styles.optionButton} ${styles.grade4} ${
                    selectedGrade === 4 ? styles.active : ""
                  }`}
                  onClick={() => setSelectedGrade(4)}
                  data-tooltip="Chọn Lớp 4 nhé! 🐹"
                >
                  <span className={styles.buttonIcon}>🐹</span> Lớp 4
                </button>
                <button
                  className={`${styles.optionButton} ${styles.grade5} ${
                    selectedGrade === 5 ? styles.active : ""
                  }`}
                  onClick={() => setSelectedGrade(5)}
                  data-tooltip="Chọn Lớp 5 nhé! 🐸"
                >
                  <span className={styles.buttonIcon}>🐸</span> Lớp 5
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.inputResultSection}>
          <div className={styles.inputResultContainer}>
            <div className={styles.textInputContainer}>
              <h3 className={styles.sectionTitle}>
                Nhập văn bản muốn tóm tắt nha! 😄
              </h3>
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
                  {isLoading ? (
                    <span className={styles.loadingSpinner}>Đang tóm tắt... ⏳</span>
                  ) : (
                    "Tóm tắt nào! 🌈"
                  )}
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
              {selectedSummary && (
                <div className={styles.imageActionButtons}>
                  <button
                    className={styles.generateImageButton}
                    onClick={generateImage}
                    disabled={isGeneratingImage}
                  >
                    {isGeneratingImage ? (
                      <span className={styles.loadingSpinner}>Đang tạo... ⏳</span>
                    ) : (
                      "Tạo ảnh bằng AI 🎨"
                    )}
                  </button>
                  <label
                    htmlFor="image-upload"
                    className={styles.uploadImageButton}
                  >
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

            <div className={styles.resultContainer}>
              {!showHistory ? (
                <>
                  <h3 className={styles.sectionTitle}>
                    Kết quả tóm tắt đây nha! 🎉
                  </h3>
                  <div className={styles.resultBox}>
                    <p className={styles.resultText}>
                      {selectedSummary ||
                        "Chưa có kết quả! Tóm tắt để xem nha! 😊"}
                    </p>
                  </div>
                  {summaries.length > 0 && (
                    <div className={styles.summaryOptionsContainer}>
                      <h3 className={styles.sectionTitle}>
                        Bản tóm tắt mới nhất 🌟
                      </h3>
                      <div className={styles.summaryOptions}>
                        {summaries.map((summary, index) => (
                          <div
                            key={index}
                            className={`${styles.summaryOption} ${
                              selectedSummary === summary.content
                                ? styles.selected
                                : ""
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
                  <h3 className={styles.sectionTitle}>
                    Lịch sử tóm tắt của phiên này! 🕒
                  </h3>
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
                                    selectedSummary === history.content
                                      ? styles.selected
                                      : ""
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
                  className={`${styles.tabButton} ${
                    !showHistory ? styles.activeTab : ""
                  }`}
                  onClick={() => setShowHistory(false)}
                >
                  Tóm tắt hiện tại 📝
                </button>
                <button
                  className={`${styles.tabButton} ${
                    showHistory ? styles.activeTab : ""
                  }`}
                  onClick={handleShowHistory}
                >
                  Xem lịch sử 🕒
                </button>
              </div>
            </div>
          </div>
        </div>

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