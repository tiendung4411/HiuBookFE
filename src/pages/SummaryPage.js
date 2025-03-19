import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import styles from "../styles/SummaryPage.module.css";
import * as pdfjsLib from "pdfjs-dist";
import Lottie from "lottie-react";
import whaleAnimation from "../assets/images/animation/Animation - 1741792766942.json"; // Import Lottie animation
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
  FaArrowRight,
  FaTimes,
  FaQuestionCircle,
  FaTrash
} from "react-icons/fa";
import Confetti from "react-confetti"; // Thêm thư viện confetti

// Đăng ký các thành phần cần thiết cho Chart.js
Chart.register(
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Dữ liệu các bước hướng dẫn chi tiết cho SummaryPage
const guideSteps = [
  {
    step: 1,
    message:
      "Chào bé! Chú cá voi sẽ hướng dẫn tóm tắt sách nha! 🐳 Hãy nhấn 'Tiếp theo' để bắt đầu nhé! 😄",
    icon: "🐳",
    highlight: null // Không highlight bước đầu
  },
  {
    step: 2,
    message:
      "Bước 1: Chọn kiểu tóm tắt! Nhấn 'Trích xuất' để lấy đoạn chính, hoặc 'Diễn giải' để viết lại nha! 🌟 Ví dụ: Chọn 'Trích xuất' để giữ nguyên câu gốc! 😊",
    icon: "🌟",
    highlight: ".methodExtract, .methodParaphrase" // Highlight các nút chọn kiểu tóm tắt
  },
  {
    step: 3,
    message:
      "Bước 2: Chọn lớp học của bé! Nhấn vào một lớp (Lớp 1 đến Lớp 5) để phù hợp với độ tuổi nha! 🐾 Ví dụ: Nhấn 'Lớp 1' để bắt đầu! 🐱",
    icon: "🐾",
    highlight: ".grade1" // Highlight nút Lớp 1 làm ví dụ
  },
  {
    step: 4,
    message:
      "Bước 3: Nhập câu chuyện hoặc bài học vào ô lớn này! Ví dụ: Gõ 'Cô bé quàng khăn đỏ đi vào rừng...' rồi nhấn Enter! ✍️",
    icon: "✍️",
    highlight: ".textArea" // Highlight ô nhập văn bản
  },
  {
    step: 5,
    message:
      "Bước 4: Muốn dùng file PDF? Nhấn 'Tải PDF' và chọn file từ máy tính nha! 📄 Chú cá voi sẽ đọc giúp bé! 😊",
    icon: "📄",
    highlight: ".uploadButton" // Highlight nút Tải PDF
  },
  {
    step: 6,
    message:
      "Bước 5: Nhấn 'Tóm tắt nào!' để xem kết quả siêu nhanh! 🌈 Chú cá voi sẽ nhảy lên khi bé nhấn nha! 🎉",
    icon: "🌈",
    highlight: ".submitButton" // Highlight nút Tóm tắt
  },
  {
    step: 7,
    message:
      "Bước 6: Nhiều bản tóm tắt sẽ hiện ra! Chọn bản bạn thích nhất bằng cách nhấn 'Chọn bản này!' nhé! 📝 Ví dụ: Chọn bản 'Ngắn' để thử! 😄",
    icon: "📝",
    highlight: ".summaryOption" // Highlight danh sách bản tóm tắt
  },
  {
    step: 8,
    message:
      "Bước 7: Xem lịch sử tóm tắt cũ bằng cách nhấn 'Xem lịch sử' nhé! 🕒 Chọn lại bản bạn thích hoặc xóa nếu không cần! 😊",
    icon: "🕒",
    highlight: ".historyTab" // Highlight tab lịch sử
  },
  {
    step: 9,
    message:
      "Bước 8: Xem biểu đồ để biết tóm tắt có hay không nha! Nhấn vào 'Số từ' hoặc các biểu đồ khác để phóng to! 📊 Ví dụ: Nhấn 'Số từ' để xem! 😄",
    icon: "📊",
    highlight: ".evaluationItem:nth-child(1)" // Highlight biểu đồ Số từ
  },
  {
    step: 10,
    message:
      "Bước 9: Muốn tạo hình ảnh? Nhấn 'Tạo và công khai hình ảnh' sau khi tóm tắt nha! 🎨 Chú cá voi chúc bé vui! 🐳",
    icon: "🎨",
    highlight: ".generateImageButton" // Highlight nút tạo hình ảnh
  },
  {
    step: 11,
    message:
      "Tuyệt vời lắm! Bé đã học xong cách tóm tắt rồi! 🎉 Nhấn 'Tiếp theo' để kết thúc, hoặc 'Bỏ qua' để chơi ngay nha! 😄",
    icon: "🎉",
    highlight: null
  }
];

const SummaryPage = () => {
  const [selectedMethod, setSelectedMethod] = useState("extract");
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [textInput, setTextInput] = useState("");
  const [summaryResult, setSummaryResult] = useState("");
  const [summaries, setSummaries] = useState([]); // Lưu các bản tóm tắt hiện tại
  const [selectedSummary, setSelectedSummary] = useState(""); // Bản tóm tắt được chọn
  const [historySummaries, setHistorySummaries] = useState([]); // Lịch sử tóm tắt
  const [showHistory, setShowHistory] = useState(false); // Chuyển đổi giữa hiện tại và lịch sử
  const [wordCountChart, setWordCountChart] = useState(null);
  const [keywordChart, setKeywordChart] = useState(null);
  const [sentenceLengthChart, setSentenceLengthChart] = useState(null);
  const [rougeChart, setRougeChart] = useState(null);
  const [bleuChart, setBleuChart] = useState(null);
  const [meteorChart, setMeteorChart] = useState(null);
  const [metricsChart, setMetricsChart] = useState(null);
  const [expandedChart, setExpandedChart] = useState(null);
  const [showGuideSteps, setShowGuideSteps] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const wordCountRef = useRef(null);
  const keywordRef = useRef(null);
  const sentenceLengthRef = useRef(null);
  const rougeRef = useRef(null);
  const bleuRef = useRef(null);
  const meteorRef = useRef(null);
  const metricsRef = useRef(null);

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";

  const summarizeText = (text) => {
    const words = text.split(" ").filter((word) => word);
    const totalWords = words.length;

    const baseRatio =
      selectedGrade <= 2 ? 0.1 : selectedGrade <= 4 ? 0.15 : 0.2;
    const shortSummaryLength = Math.floor(totalWords * baseRatio);
    const mediumSummaryLength = Math.floor(totalWords * (baseRatio + 0.1));
    const longSummaryLength = Math.floor(totalWords * (baseRatio + 0.2));

    const shortSummary = words.slice(0, shortSummaryLength).join(" ") + "...";
    const mediumSummary = words.slice(0, mediumSummaryLength).join(" ") + "...";
    const longSummary = words.slice(0, longSummaryLength).join(" ") + "...";

    return [
      { type: "Ngắn", content: shortSummary, wordCount: shortSummaryLength },
      {
        type: "Trung bình",
        content: mediumSummary,
        wordCount: mediumSummaryLength
      },
      { type: "Dài", content: longSummary, wordCount: longSummaryLength }
    ];
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      try {
        const fileReader = new FileReader();
        fileReader.onload = async () => {
          const typedArray = new Uint8Array(fileReader.result);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText +=
              textContent.items.map((item) => item.str).join(" ") + " ";
          }
          const summaryList = summarizeText(fullText);
          setSummaries(summaryList);
          setSelectedSummary(summaryList[0].content);
          setSummaryResult(summaryList[0].content);
          // Lưu vào lịch sử
          const newHistory = [
            ...historySummaries,
            {
              text: fullText,
              summaries: summaryList,
              timestamp: new Date().toLocaleString()
            }
          ];
          setHistorySummaries(newHistory);
          localStorage.setItem("summaryHistory", JSON.stringify(newHistory));
        };
        fileReader.readAsArrayBuffer(file);
      } catch (error) {
        setSummaries([]);
        setSelectedSummary("Ôi! Có lỗi khi đọc file PDF nha! 😅");
        setSummaryResult("Ôi! Có lỗi khi đọc file PDF nha! 😅");
        console.error(error);
      }
    } else {
      setSummaries([]);
      setSelectedSummary("Ôi! Hãy chọn file PDF nha! 😅");
      setSummaryResult("Ôi! Hãy chọn file PDF nha! 😅");
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      const summaryList = summarizeText(textInput);
      setSummaries(summaryList);
      setSelectedSummary(summaryList[0].content);
      setSummaryResult(summaryList[0].content);
      // Lưu vào lịch sử
      const newHistory = [
        ...historySummaries,
        {
          text: textInput,
          summaries: summaryList,
          timestamp: new Date().toLocaleString()
        }
      ];
      setHistorySummaries(newHistory);
      localStorage.setItem("summaryHistory", JSON.stringify(newHistory));
    } else {
      setSummaries([]);
      setSelectedSummary("Nhập gì đó để tóm tắt nha! 😄");
      setSummaryResult("Nhập gì đó để tóm tắt nha! 😄");
    }
  };

  const handleReset = () => {
    setTextInput("");
    setSummaries([]);
    setSelectedSummary("");
    setSummaryResult("");
  };

  const generateImage = () => {
    if (selectedSummary) {
      if (
        window.confirm(
          "Bạn muốn tạo hình ảnh dựa trên nội dung tóm tắt và công khai nó?"
        )
      ) {
        alert(
          "Hình ảnh đã được tạo và công khai! (Tính năng này cần tích hợp API thực tế)"
        );
      }
    } else {
      alert("Vui lòng tóm tắt trước khi tạo hình ảnh!");
    }
  };

  const handleSelectSummary = (summary) => {
    setSelectedSummary(summary.content);
    setSummaryResult(summary.content);
    setShowConfetti(true);
    alert(`Bạn đã chọn bản tóm tắt ${summary.type}! 🎉`);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleSelectHistorySummary = (summary) => {
    setSelectedSummary(summary.content);
    setSummaryResult(summary.content);
    setShowConfetti(true);
    alert(`Bạn đã chọn lại bản tóm tắt ${summary.type} từ lịch sử! 🎉`);
    setTimeout(() => setShowConfetti(false), 3000);
    setShowHistory(false); // Quay lại tab hiện tại sau khi chọn
  };

  const handleDeleteHistorySummary = (index) => {
    if (window.confirm("Bạn có chắc muốn xóa lần tóm tắt này không?")) {
      const updatedHistory = historySummaries.filter((_, i) => i !== index);
      setHistorySummaries(updatedHistory);
      localStorage.setItem("summaryHistory", JSON.stringify(updatedHistory));
      alert("Đã xóa lần tóm tắt này! 🗑️");
    }
  };

  const handleChartClick = (chartId) => {
    setExpandedChart(expandedChart === chartId ? null : chartId);
  };

  useEffect(() => {
    setShowGuideSteps(true);

    if (selectedSummary) {
      if (wordCountChart) wordCountChart.destroy();
      if (keywordChart) keywordChart.destroy();
      if (sentenceLengthChart) sentenceLengthChart.destroy();
      if (rougeChart) rougeChart.destroy();
      if (bleuChart) bleuChart.destroy();
      if (meteorChart) meteorChart.destroy();
      if (metricsChart) metricsChart.destroy();

      const originalWordCount = textInput
        .split(" ")
        .filter((word) => word).length;
      const summaryWordCount = selectedSummary
        .split(" ")
        .filter((word) => word).length;

      if (wordCountRef && wordCountRef.current) {
        const newWordCountChart = new Chart(wordCountRef.current, {
          type: "bar",
          data: {
            labels: ["Văn bản gốc", "Tóm tắt"],
            datasets: [
              {
                label: "Số từ",
                data: [originalWordCount, summaryWordCount],
                backgroundColor: ["#1e90ff", "#32cd32"],
                borderColor: ["#1e90ff", "#32cd32"],
                borderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: Math.max(originalWordCount, summaryWordCount) + 20,
                title: {
                  display: true,
                  text: "Số từ",
                  font: { size: 16, family: "'Comic Sans MS', sans-serif" },
                  padding: 10
                },
                ticks: {
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" }
                }
              },
              x: {
                title: {
                  display: true,
                  text: "Loại văn bản",
                  font: { size: 16, family: "'Comic Sans MS', sans-serif" },
                  padding: 10
                },
                ticks: {
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" },
                  padding: 5,
                  maxRotation: 0,
                  minRotation: 0
                }
              }
            },
            plugins: {
              legend: {
                labels: {
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" }
                }
              },
              tooltip: {
                titleFont: { size: 14, family: "'Comic Sans MS', sans-serif" },
                bodyFont: { size: 14, family: "'Comic Sans MS', sans-serif" }
              }
            },
            layout: { padding: { bottom: 20 } }
          }
        });
        setWordCountChart(newWordCountChart);
      }

      if (keywordRef && keywordRef.current) {
        const newKeywordChart = new Chart(keywordRef.current, {
          type: "bar",
          data: {
            labels: ["Truyện", "Học", "Vui"],
            datasets: [
              {
                label: "Tần suất từ khóa",
                data: [5, 4, 3],
                backgroundColor: "#ffa500",
                borderColor: "#ff8c00",
                borderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 10,
                title: {
                  display: true,
                  text: "Tần suất",
                  font: { size: 16, family: "'Comic Sans MS', sans-serif" },
                  padding: 10
                },
                ticks: {
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" }
                }
              },
              x: {
                title: {
                  display: true,
                  text: "Từ khóa",
                  font: { size: 16, family: "'Comic Sans MS', sans-serif" },
                  padding: 10
                },
                ticks: {
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" },
                  padding: 5,
                  maxRotation: 0,
                  minRotation: 0
                }
              }
            },
            plugins: {
              legend: {
                labels: {
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" }
                }
              },
              tooltip: {
                titleFont: { size: 14, family: "'Comic Sans MS', sans-serif" },
                bodyFont: { size: 14, family: "'Comic Sans MS', sans-serif" }
              }
            },
            layout: { padding: { bottom: 20 } }
          }
        });
        setKeywordChart(newKeywordChart);
      }

      if (sentenceLengthRef && sentenceLengthRef.current) {
        const newSentenceLengthChart = new Chart(sentenceLengthRef.current, {
          type: "bar",
          data: {
            labels: ["Độ dài trung bình"],
            datasets: [
              {
                label: "Số từ",
                data: [5],
                backgroundColor: "#32cd32",
                borderColor: "#32cd32",
                borderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 10,
                title: {
                  display: true,
                  text: "Số từ",
                  font: { size: 16, family: "'Comic Sans MS', sans-serif" },
                  padding: 10
                },
                ticks: {
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" }
                }
              },
              x: {
                title: {
                  display: true,
                  text: "Thông số",
                  font: { size: 16, family: "'Comic Sans MS', sans-serif" },
                  padding: 10
                },
                ticks: {
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" },
                  padding: 5,
                  maxRotation: 0,
                  minRotation: 0
                }
              }
            },
            plugins: {
              legend: {
                labels: {
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" }
                }
              },
              tooltip: {
                titleFont: { size: 14, family: "'Comic Sans MS', sans-serif" },
                bodyFont: { size: 14, family: "'Comic Sans MS', sans-serif" }
              }
            },
            layout: { padding: { bottom: 20 } }
          }
        });
        setSentenceLengthChart(newSentenceLengthChart);
      }

      if (rougeRef && rougeRef.current) {
        const newRougeChart = new Chart(rougeRef.current, {
          type: "bar",
          data: {
            labels: ["ROUGE-1", "ROUGE-2", "ROUGE-L"],
            datasets: [
              {
                label: "Điểm ROUGE",
                data: [0.75, 0.55, 0.7],
                backgroundColor: "#1e90ff",
                borderColor: "#1e90ff",
                borderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 1,
                title: {
                  display: true,
                  text: "Điểm số",
                  font: { size: 16, family: "'Comic Sans MS', sans-serif" },
                  padding: 10
                },
                ticks: {
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" }
                }
              },
              x: {
                title: {
                  display: true,
                  text: "Chỉ số ROUGE",
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" },
                  padding: 10
                },
                ticks: {
                  font: { size: 12, family: "'Comic Sans MS', sans-serif" },
                  padding: 5,
                  maxRotation: 0,
                  minRotation: 0
                }
              }
            },
            plugins: {
              legend: {
                labels: {
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" }
                }
              },
              tooltip: {
                titleFont: { size: 14, family: "'Comic Sans MS', sans-serif" },
                bodyFont: { size: 14, family: "'Comic Sans MS', sans-serif" }
              }
            },
            layout: { padding: { bottom: 30 } }
          }
        });
        setRougeChart(newRougeChart);
      }

      if (bleuRef && bleuRef.current) {
        const newBleuChart = new Chart(bleuRef.current, {
          type: "bar",
          data: {
            labels: ["Chỉ số BLEU"],
            datasets: [
              {
                label: "Điểm BLEU",
                data: [0.65],
                backgroundColor: "#ff69b4",
                borderColor: "#ff69b4",
                borderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 1,
                title: {
                  display: true,
                  text: "Điểm số",
                  font: { size: 16, family: "'Comic Sans MS', sans-serif" },
                  padding: 10
                },
                ticks: {
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" }
                }
              },
              x: {
                title: {
                  display: true,
                  text: "Chỉ số BLEU",
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" },
                  padding: 10
                },
                ticks: {
                  font: { size: 12, family: "'Comic Sans MS', sans-serif" },
                  padding: 5,
                  maxRotation: 0,
                  minRotation: 0
                }
              }
            },
            plugins: {
              legend: {
                labels: {
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" }
                }
              },
              tooltip: {
                titleFont: { size: 14, family: "'Comic Sans MS', sans-serif" },
                bodyFont: { size: 14, family: "'Comic Sans MS', sans-serif" }
              }
            },
            layout: { padding: { bottom: 30 } }
          }
        });
        setBleuChart(newBleuChart);
      }

      if (meteorRef && meteorRef.current) {
        const newMeteorChart = new Chart(meteorRef.current, {
          type: "bar",
          data: {
            labels: ["METEOR"],
            datasets: [
              {
                label: "Điểm METEOR",
                data: [0.7],
                backgroundColor: "#1e90ff",
                borderColor: "#1e90ff",
                borderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 1,
                title: {
                  display: true,
                  text: "Điểm số",
                  font: { size: 16, family: "'Comic Sans MS', sans-serif" },
                  padding: 10
                },
                ticks: {
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" }
                }
              },
              x: {
                title: {
                  display: true,
                  text: "Chỉ số METEOR",
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" },
                  padding: 10
                },
                ticks: {
                  font: { size: 12, family: "'Comic Sans MS', sans-serif" },
                  padding: 5,
                  maxRotation: 0,
                  minRotation: 0
                }
              }
            },
            plugins: {
              legend: {
                labels: {
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" }
                }
              },
              tooltip: {
                titleFont: { size: 14, family: "'Comic Sans MS', sans-serif" },
                bodyFont: { size: 14, family: "'Comic Sans MS', sans-serif" }
              }
            },
            layout: { padding: { bottom: 30 } }
          }
        });
        setMeteorChart(newMeteorChart);
      }

      if (metricsRef && metricsRef.current) {
        const newMetricsChart = new Chart(metricsRef.current, {
          type: "bar",
          data: {
            labels: ["Dễ đọc", "Chính xác"],
            datasets: [
              {
                label: "Phần trăm",
                data: [80, 90],
                backgroundColor: ["#40e0d0", "#dda0dd"],
                borderColor: ["#40e0d0", "#dda0dd"],
                borderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: "Phần trăm (%)",
                  font: { size: 16, family: "'Comic Sans MS', sans-serif" },
                  padding: 10
                },
                ticks: {
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" }
                }
              },
              x: {
                title: {
                  display: true,
                  text: "Chỉ số",
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" },
                  padding: 10
                },
                ticks: {
                  font: { size: 12, family: "'Comic Sans MS', sans-serif" },
                  padding: 5,
                  maxRotation: 0,
                  minRotation: 0
                }
              }
            },
            plugins: {
              legend: {
                labels: {
                  font: { size: 14, family: "'Comic Sans MS', sans-serif" }
                }
              },
              tooltip: {
                titleFont: { size: 14, family: "'Comic Sans MS', sans-serif" },
                bodyFont: { size: 14, family: "'Comic Sans MS', sans-serif" }
              }
            },
            layout: { padding: { bottom: 30 } }
          }
        });
        setMetricsChart(newMetricsChart);
      }
    }
  }, [selectedSummary]);

  useEffect(() => {
    // Lấy lịch sử từ localStorage khi tải trang
    const savedHistory = localStorage.getItem("summaryHistory");
    if (savedHistory) {
      setHistorySummaries(JSON.parse(savedHistory));
    }
  }, []);

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
                  }`} // Nhảy khi đến bước quan trọng
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
                      display: currentStep > 1 ? "block" : "none", // Ẩn ở bước 1
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

        <section className={styles.guideSection}>
          <h2 className={styles.guideTitle}>
            Hướng dẫn vui cho các bạn nhỏ! 🌈
          </h2>
          <div className={styles.guideContainer}>
            <div className={styles.guideItem}>
              <span className={styles.guideIcon}>🌊</span>
              <p>1. Chọn kiểu tóm tắt (Trích xuất hoặc Diễn giải) nha! 😄</p>
            </div>
            <div className={styles.guideItem}>
              <span className={styles.guideIcon}>🐾</span>
              <p>2. Chọn lớp học của bạn (Lớp 1-5) nhé! 🐱🐶🐰🐹🐸</p>
            </div>
            <div className={styles.guideItem}>
              <span className={styles.guideIcon}>✏️</span>
              <p>3. Gõ câu chuyện hoặc bài học vào ô lớn! 📝</p>
            </div>
            <div className={styles.guideItem}>
              <span className={styles.guideIcon}>📄</span>
              <p>4. Hoặc nhấn 'Tải PDF' để dùng file có sẵn! 📥</p>
            </div>
            <div className={styles.guideItem}>
              <span className={styles.guideIcon}>🚀</span>
              <p>5. Nhấn 'Tóm tắt nào!' để xem kết quả siêu vui! 🎉</p>
            </div>
            <div className={styles.guideItem}>
              <span className={styles.guideIcon}>📝</span>
              <p>6. Chọn bản tóm tắt ưng ý từ các lựa chọn! 🌟</p>
            </div>
            <div className={styles.guideItem}>
              <span className={styles.guideIcon}>🕒</span>
              <p>
                7. Xem lịch sử tóm tắt cũ bằng cách nhấn 'Xem lịch sử' nhé! 😊
              </p>
            </div>
            <div className={styles.guideItem}>
              <span className={styles.guideIcon}>📊</span>
              <p>8. Xem các biểu đồ để học thêm (cho khóa luận nha)! 🎓</p>
            </div>
          </div>
        </section>

        <div className={styles.headerContainer}>
          <div className={styles.optionColumn}>
            <div className={styles.optionSection}>
              <h3 className={styles.optionTitle}>Chọn kiểu tóm tắt 🌟</h3>
              <div className={styles.optionGroup}>
                <button
                  className={`${styles.optionButton} ${styles.methodExtract} ${
                    selectedMethod === "extract" ? styles.active : ""
                  }`}
                  onClick={() => setSelectedMethod("extract")}
                  data-tooltip="Nhấn để Trích xuất văn bản! 🌊"
                >
                  <span className={styles.buttonIcon}>🌊</span> Trích xuất
                </button>
                <button
                  className={`${styles.optionButton} ${
                    styles.methodParaphrase
                  } ${selectedMethod === "paraphrase" ? styles.active : ""}`}
                  onClick={() => setSelectedMethod("paraphrase")}
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
                  data-tooltip="Chọn Lớp 1 nhé! 🐱"
                >
                  <span className={styles.buttonIcon}>🐱</span> Lớp 1
                </button>
                <button
                  className={`${styles.optionButton} ${styles.grade2} ${
                    selectedGrade === 2 ? styles.active : ""
                  }`}
                  onClick={() => setSelectedGrade(2)}
                  data-tooltip="Chọn Lớp 2 nhé! 🐶"
                >
                  <span className={styles.buttonIcon}>🐶</span> Lớp 2
                </button>
                <button
                  className={`${styles.optionButton} ${styles.grade3} ${
                    selectedGrade === 3 ? styles.active : ""
                  }`}
                  onClick={() => setSelectedGrade(3)}
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
              <div className={styles.inputWrapper}>
                <div className={styles.textInputArea}>
                  <h3 className={styles.sectionTitle}>
                    Nhập văn bản muốn tóm tắt nha! 😄
                  </h3>
                  <textarea
                    className={styles.textArea}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Nhập văn bản muốn tóm tắt nha! 😄"
                  />
                </div>
              </div>
              <div className={styles.buttonRow}>
                <button
                  className={styles.submitButton}
                  onClick={() => {
                    handleTextSubmit();
                    generateImage();
                  }}
                  disabled={!textInput.trim()}
                >
                  <span className={styles.buttonIcon}>🌈</span> Tóm tắt nào!
                </button>
                <label htmlFor="file-upload" className={styles.uploadButton}>
                  <span className={styles.buttonIcon}>📄</span> Tải PDF
                  <input
                    type="file"
                    id="file-upload"
                    className={styles.fileInput}
                    onChange={(e) => {
                      handleFileUpload(e);
                      generateImage();
                    }}
                    accept=".pdf"
                  />
                </label>
                <button className={styles.resetButton} onClick={handleReset}>
                  <span className={styles.buttonIcon}>🧹</span> Xóa hết
                </button>
              </div>
              {selectedSummary && (
                <button
                  className={styles.generateImageButton}
                  onClick={generateImage}
                >
                  Tạo và công khai hình ảnh
                </button>
              )}
            </div>

            <div className={styles.resultContainer}>
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
                  onClick={() => setShowHistory(true)}
                >
                  Xem lịch sử 🕒
                </button>
              </div>
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
                        Chọn bản tóm tắt ưng ý nha! 🌟
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
                              Bản tóm tắt {summary.type} ({summary.wordCount}{" "}
                              từ) 📜
                            </p>
                            <p className={styles.summaryOptionContent}>
                              {summary.content}
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
                    Lịch sử tóm tắt của bé! 🕒
                  </h3>
                  {historySummaries.length > 0 ? (
                    <div className={styles.historyContainer}>
                      {historySummaries.map((history, index) => (
                        <div key={index} className={styles.historyItem}>
                          <div className={styles.historyHeader}>
                            <p className={styles.historyTimestamp}>
                              Lần tóm tắt {index + 1} ({history.timestamp})
                            </p>
                            <button
                              className={styles.deleteHistoryButton}
                              onClick={() => handleDeleteHistorySummary(index)}
                              title="Xóa lần tóm tắt này"
                            >
                              <FaTrash />
                            </button>
                          </div>
                          <div className={styles.historySummaryOptions}>
                            {history.summaries.map((summary, sIndex) => (
                              <div
                                key={sIndex}
                                className={`${styles.summaryOption} ${
                                  selectedSummary === summary.content
                                    ? styles.selected
                                    : ""
                                }`}
                                onClick={() =>
                                  handleSelectHistorySummary(summary)
                                }
                              >
                                <p className={styles.summaryOptionTitle}>
                                  Bản tóm tắt {summary.type} (
                                  {summary.wordCount} từ) 📜
                                </p>
                                <p className={styles.summaryOptionContent}>
                                  {summary.content}
                                </p>
                                <button className={styles.selectSummaryButton}>
                                  Chọn lại! ✅
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.resultText}>
                      Chưa có lịch sử tóm tắt nào! 😊
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <section className={styles.evaluationSection}>
          <h2 className={styles.evaluationTitle}>
            Biểu đồ chỉ số đánh giá chất lượng tóm tắt 🎯
          </h2>
          <div className={styles.evaluationContainer}>
            <div
              className={`${styles.evaluationItem} ${
                expandedChart === "wordCount" ? styles.expanded : ""
              }`}
              onClick={() => handleChartClick("wordCount")}
            >
              <p>Số từ 📊</p>
              <canvas ref={wordCountRef} id="wordCountChart"></canvas>
            </div>
            <div
              className={`${styles.evaluationItem} ${
                expandedChart === "keyword" ? styles.expanded : ""
              }`}
              onClick={() => handleChartClick("keyword")}
            >
              <p>Từ khóa nổi bật 🔑</p>
              <canvas ref={keywordRef} id="keywordChart"></canvas>
            </div>
            <div
              className={`${styles.evaluationItem} ${
                expandedChart === "sentenceLength" ? styles.expanded : ""
              }`}
              onClick={() => handleChartClick("sentenceLength")}
            >
              <p>Độ dài câu trung bình 📈</p>
              <canvas ref={sentenceLengthRef} id="sentenceLengthChart"></canvas>
            </div>
            <div
              className={`${styles.evaluationItem} ${
                expandedChart === "rouge" ? styles.expanded : ""
              }`}
              onClick={() => handleChartClick("rouge")}
            >
              <p>Đồ thị ROUGE 📊</p>
              <canvas ref={rougeRef} id="rougeChart"></canvas>
            </div>
            <div
              className={`${styles.evaluationItem} ${
                expandedChart === "bleu" ? styles.expanded : ""
              }`}
              onClick={() => handleChartClick("bleu")}
            >
              <p>Đồ thị BLEU 📉</p>
              <canvas ref={bleuRef} id="bleuChart"></canvas>
            </div>
            <div
              className={`${styles.evaluationItem} ${
                expandedChart === "meteor" ? styles.expanded : ""
              }`}
              onClick={() => handleChartClick("meteor")}
            >
              <p>Đồ thị METEOR 📉</p>
              <canvas ref={meteorRef} id="meteorChart"></canvas>
            </div>
            <div
              className={`${styles.evaluationItem} ${
                expandedChart === "metrics" ? styles.expanded : ""
              }`}
              onClick={() => handleChartClick("metrics")}
            >
              <p>Chỉ số bổ sung 📋</p>
              <canvas ref={metricsRef} id="metricsChart"></canvas>
            </div>
          </div>
        </section>

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
