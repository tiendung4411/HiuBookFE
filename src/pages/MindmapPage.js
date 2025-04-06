import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import styles from "../styles/MindmapPage.module.css";
import Go from "gojs";
import { ClipLoader } from "react-spinners";
import {
  FaMap,
  FaTrash,
  FaStar,
  FaFilePdf,
  FaSearchPlus,
  FaExpand,
  FaTimes,
} from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import { processPdf } from "../api/summaries"; // Import the processPdf function

const MindmapPage = () => {
  const [textInput, setTextInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mindmaps, setMindmaps] = useState([]);
  const [activeMindmap, setActiveMindmap] = useState(null);
  const [diagramType, setDiagramType] = useState("tree");
  const [questions, setQuestions] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mindmapRef = useRef(null);
  const modalMindmapRef = useRef(null);
  const goDiagramRef = useRef(null);

  // Khởi tạo Gemini API với API key
  const genAI = new GoogleGenerativeAI(
    "AIzaSyBGoIsACZY4vbiEg5jyf8Sbf7XIdAgf9cc"
  );

  // Hàm gọi Gemini API với xử lý lỗi chi tiết
  const callGeminiAPI = async (prompt) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (!text) {
        throw new Error("API trả về nội dung rỗng");
      }
      return text;
    } catch (error) {
      console.error("Lỗi khi gọi Gemini API:", {
        message: error.message,
        stack: error.stack,
      });
      throw new Error(
        "Không thể gọi API. Vui lòng kiểm tra API key, quota hoặc kết nối mạng."
      );
    }
  };

  const generateDiagramData = async (text, type) => {
    const prompt = `Phân tích câu chuyện sau và trả về dữ liệu JSON hợp lệ cho sơ đồ ${type}. Đảm bảo dữ liệu ở định dạng JSON chính xác, không chứa ký tự markdown như \`\`\`json hoặc text ngoài JSON. Ví dụ: 
      - Nếu là "tree": {"tree": {"title": "Tiêu đề", "branches": ["Nhánh 1", "Nhánh 2"]}}
      - Nếu là "flowchart": {"flowchart": {"events": ["Sự kiện 1", "Sự kiện 2"]}}
      - Nếu là "circle": {"circle": {"theme": "Chủ đề", "details": ["Chi tiết 1", "Chi tiết 2"]}}
      - Nếu là "timeline": {"timeline": {"timeline": ["Thời điểm 1", "Thời điểm 2"]}}
      - Nếu là "fishbone": {"fishbone": {"result": "Kết quả", "causes": ["Nguyên nhân 1", "Nguyên nhân 2"]}}
      Câu chuyện: ${text}`;

    try {
      const responseText = await callGeminiAPI(prompt);
      console.log("Dữ liệu thô từ API:", responseText);
      let parsedData;
      try {
        const cleanedText = responseText.replace(/```json|```/g, "").trim();
        parsedData = JSON.parse(cleanedText);
      } catch (jsonError) {
        console.error("Lỗi khi parse JSON:", jsonError, "Dữ liệu thô:", responseText);
        throw new Error("Dữ liệu trả về từ API không phải JSON hợp lệ");
      }
      if (!parsedData || typeof parsedData !== "object") {
        throw new Error("Dữ liệu JSON không đúng cấu trúc");
      }
      const extractedData = parsedData[type] || {
        title: "Lỗi dữ liệu",
        branches: ["Dữ liệu không khớp với loại sơ đồ"],
      };
      return extractedData;
    } catch (error) {
      console.error("Lỗi khi tạo dữ liệu sơ đồ:", error);
      return {
        title: "Lỗi dữ liệu",
        branches: ["Kiểm tra lại nội dung hoặc API"],
      };
    }
  };

  const getRandomColor = () => {
    const colors = ["#b3e5fc", "#e0f7ff", "#81d4fa", "#4fc3f7"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Hàm xử lý upload PDF bằng API
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Vui lòng chọn file PDF!");
      return;
    }

    setIsLoading(true);
    try {
      const { cleanedText } = await processPdf(file); // Gọi API để xử lý PDF
      setTextInput(cleanedText.trim()); // Đặt cleaned_text từ backend vào textInput
    } catch (error) {
      console.error("Lỗi khi xử lý PDF:", error);
      alert("Đã có lỗi khi xử lý file PDF, thử lại nhé!");
    }
    setIsLoading(false);
  };

  // Hàm khởi tạo sơ đồ GoJS
  const initializeDiagram = (ref, diagramType, activeMap) => {
    if (!ref.current) return null;

    if (goDiagramRef.current) {
      goDiagramRef.current.div = null;
    }
    const $ = Go.GraphObject.make;
    const diagram = $(Go.Diagram, ref.current, {
      layout: getLayout(diagramType),
      "undoManager.isEnabled": true,
      initialContentAlignment: Go.Spot.Center,
      initialAutoScale: Go.Diagram.Uniform,
    });

    diagram.nodeTemplate = $(
      Go.Node,
      "Auto",
      $(Go.Shape, "RoundedRectangle", {
        fill: getRandomColor(),
        strokeWidth: 2,
        stroke: "#00bcd4",
        parameter1: 10,
      }),
      $(
        Go.TextBlock,
        {
          margin: 10,
          font: "bold 24px Comic Neue, sans-serif",
          stroke: "#333",
          textAlign: "center",
          maxSize: new Go.Size(300, NaN),
        },
        new Go.Binding("text", "key")
      )
    );

    diagram.linkTemplate = $(
      Go.Link,
      { routing: Go.Link.Orthogonal, corner: 5 },
      $(Go.Shape, { strokeWidth: 2, stroke: "#00bcd4" }),
      $(Go.Shape, { toArrow: "Standard", fill: "#00bcd4", stroke: null })
    );

    if (activeMap) {
      const data = createDiagramData(activeMap, diagramType);
      diagram.model =
        diagramType === "flowchart"
          ? new Go.GraphLinksModel(data.nodes, data.links)
          : new Go.TreeModel(data.nodes);
    }

    goDiagramRef.current = diagram;
    diagram.commandHandler.zoomToFit();
    return diagram;
  };

  useEffect(() => {
    if (activeMindmap === null) return;

    const activeMap = mindmaps[activeMindmap];
    if (!activeMap) return;

    if (!isModalOpen && mindmapRef.current) {
      initializeDiagram(mindmapRef, diagramType, activeMap);
    }

    if (isModalOpen && modalMindmapRef.current) {
      initializeDiagram(modalMindmapRef, diagramType, activeMap);
    }
  }, [activeMindmap, mindmaps, diagramType, isModalOpen]);

  const getLayout = (type) => {
    const $ = Go.GraphObject.make;
    switch (type) {
      case "tree":
        return $(Go.TreeLayout, {
          angle: 90,
          layerSpacing: 50,
          nodeSpacing: 30,
        });
      case "flowchart":
        return $(Go.LayeredDigraphLayout, { direction: 90 });
      case "circle":
        return $(Go.CircularLayout, { radius: 120 });
      case "timeline":
        return $(Go.GridLayout, {
          wrappingColumn: 1,
          spacing: new Go.Size(10, 20),
        });
      case "fishbone":
        return $(Go.TreeLayout, {
          angle: 0,
          alignment: Go.TreeLayout.AlignmentBus,
        });
      default:
        return $(Go.TreeLayout, { angle: 90, layerSpacing: 50 });
    }
  };

  const createDiagramData = (map, type) => {
    if (!map) return { nodes: [] };
    switch (type) {
      case "tree":
        const treeNodes = [
          { key: map.title || "Chưa có tiêu đề", isTreeExpanded: true },
        ];
        if (map.branches && Array.isArray(map.branches)) {
          map.branches.forEach((branch) => {
            treeNodes.push({
              key: branch.title,
              parent: map.title,
            });
            if (branch.branches && Array.isArray(branch.branches)) {
              branch.branches.forEach((subBranch) => {
                treeNodes.push({
                  key: subBranch,
                  parent: branch.title,
                });
              });
            }
          });
        }
        return { nodes: treeNodes };
      case "flowchart":
        const flowNodes =
          map.events && Array.isArray(map.events)
            ? map.events.map((e, i) => ({ key: e, id: i }))
            : [{ key: "Chưa có sự kiện", id: 0 }];
        const flowLinks =
          flowNodes.length > 1
            ? flowNodes.slice(1).map((n, i) => ({ from: i, to: n.id }))
            : [];
        return { nodes: flowNodes, links: flowLinks };
      case "circle":
        const circleNodes = [
          { key: map.theme || "Chưa có chủ đề", isTreeExpanded: true },
        ];
        if (map.details && Array.isArray(map.details)) {
          circleNodes.push(
            ...map.details.map((d) => ({ key: d, parent: map.theme }))
          );
        }
        return { nodes: circleNodes };
      case "timeline":
        return {
          nodes:
            map.timeline && Array.isArray(map.timeline)
              ? map.timeline.map((t) => ({ key: t }))
              : [{ key: "Chưa có thời gian" }],
        };
      case "fishbone":
        const fishNodes = [
          { key: map.result || "Chưa có kết quả", isTreeExpanded: true },
        ];
        if (map.causes && Array.isArray(map.causes)) {
          fishNodes.push(
            ...map.causes.map((c) => ({ key: c, parent: map.result }))
          );
        }
        return { nodes: fishNodes };
      default:
        return { nodes: [{ key: "Chưa có dữ liệu" }] };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await generateDiagramData(textInput, diagramType);
      const newMindmap = {
        id: mindmaps.length + 1,
        ...response,
        layout: diagramType,
      };
      setMindmaps([...mindmaps, newMindmap]);
      setActiveMindmap(mindmaps.length);

      const questionPrompt = `Tạo 3 câu hỏi đọc hiểu đơn giản từ câu chuyện sau (KHÔNG TẠO ĐÁP ÁN): ${textInput}`;
      const questionText = await callGeminiAPI(questionPrompt);
      const qList = questionText.split("\n").filter((q) => q.trim());
      setQuestions(qList);

      setTextInput("");
    } catch (error) {
      console.error("Lỗi khi tạo sơ đồ:", error);
      alert(
        "Đã có lỗi khi tạo sơ đồ. Vui lòng kiểm tra API hoặc nội dung nhập."
      );
      setQuestions(["Lỗi khi tạo câu hỏi, thử lại nhé!"]);
      setMindmaps([
        ...mindmaps,
        {
          id: mindmaps.length + 1,
          title: "Lỗi",
          branches: ["Kiểm tra lại"],
          layout: diagramType,
        },
      ]);
      setActiveMindmap(mindmaps.length);
    }
    setIsLoading(false);
  };

  const handleGenerateKeywords = async () => {
    setIsLoading(true);
    try {
      const keywordPrompt = `Liệt kê 5 từ khóa quan trọng từ câu chuyện sau: ${textInput}`;
      const keywordText = await callGeminiAPI(keywordPrompt);
      const kwList = keywordText.split(", ").map((kw) => kw.trim());
      setKeywords(kwList);
    } catch (error) {
      console.error("Lỗi khi tạo từ khóa:", error);
      setKeywords(["Lỗi khi tìm từ khóa, thử lại nhé!"]);
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setTextInput("");
    setActiveMindmap(null);
    setQuestions([]);
    setKeywords([]);
    setIsModalOpen(false);
    if (goDiagramRef.current) goDiagramRef.current.div = null;
  };

  const selectMindmap = (index) => {
    setActiveMindmap(index);
    setDiagramType(mindmaps[index].layout);
    const content =
      mindmaps[index].title || mindmaps[index].theme || mindmaps[index].result;
    callGeminiAPI(
      `Tạo 3 câu hỏi đọc hiểu đơn giản từ câu chuyện sau: ${content}`
    )
      .then((text) => setQuestions(text.split("\n").filter((q) => q.trim())))
      .catch(() => setQuestions(["Lỗi khi tạo câu hỏi!"]));
  };

  const focusDiagram = () => {
    if (goDiagramRef.current) {
      goDiagramRef.current.commandHandler.zoomToFit();
      goDiagramRef.current.scrollToRect(goDiagramRef.current.documentBounds);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setTimeout(() => {
      if (goDiagramRef.current) {
        goDiagramRef.current.commandHandler.zoomToFit();
      }
    }, 100);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (goDiagramRef.current) {
      goDiagramRef.current.div = null;
    }
  };

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <ClipLoader color="#00bcd4" size={70} />
            <p className={styles.loadingMessage}>Đang xử lý nha!</p>
          </div>
        </div>
      )}
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.inputResultSection}>
          <div className={styles.textInputContainer}>
            <h3 className={styles.sectionTitle}>
              <FaStar style={{ color: "#fff176" }} /> Nhập nội dung
            </h3>
            <form onSubmit={handleSubmit}>
              <textarea
                className={styles.textArea}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Nhập nội dung hoặc tải lên file PDF để tạo sơ đồ tư duy"
              />
              <div className={styles.buttonRow}>
                <select
                  className={styles.layoutSelect}
                  value={diagramType}
                  onChange={(e) => setDiagramType(e.target.value)}
                >
                  <option value="tree">Sơ đồ cây</option>
                  <option value="flowchart">Lưu đồ</option>
                  <option value="circle">Sơ đồ vòng</option>
                  <option value="timeline">Dòng thời gian</option>
                  <option value="fishbone">Sơ đồ xương cá</option>
                </select>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={!textInput.trim() || isLoading}
                >
                  <FaMap /> Tạo sơ đồ
                </button>
                <button
                  type="button"
                  className={styles.keywordButton}
                  onClick={handleGenerateKeywords}
                  disabled={!textInput.trim() || isLoading}
                >
                  <FaStar /> Tìm từ khóa
                </button>
                <label className={styles.uploadButton}>
                  <FaFilePdf /> Tải lên PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    hidden
                  />
                </label>
                <button
                  type="button"
                  className={styles.resetButton}
                  onClick={handleReset}
                >
                  <FaTrash /> Xóa nội dung
                </button>
              </div>
              {keywords.length > 0 && (
                <div className={styles.keywordList}>
                  {keywords.map((kw, i) => (
                    <span key={i} className={styles.keywordTag}>
                      <ReactMarkdown>{kw}</ReactMarkdown>
                    </span>
                  ))}
                </div>
              )}
            </form>
          </div>
          <div className={styles.resultContainer}>
            <h3 className={styles.sectionTitle}>
              <FaStar style={{ color: "#fff176" }} /> Kết quả sơ đồ tư duy
            </h3>
            {mindmaps.length > 0 && (
              <div className={styles.mindmapTabs}>
                {mindmaps.map((map, index) => (
                  <button
                    key={map.id}
                    className={`${styles.tabButton} ${
                      activeMindmap === index ? styles.activeTab : ""
                    }`}
                    onClick={() => selectMindmap(index)}
                  >
                    {map.title || map.theme || map.result || "Sơ đồ " + map.id}
                  </button>
                ))}
              </div>
            )}
            <div className={styles.mindmapWrapper}>
              <div ref={mindmapRef} className={styles.mindmap}>
                {activeMindmap === null && (
                  <span>
                    Nhập nội dung hoặc tải lên PDF để tạo sơ đồ tư duy!
                  </span>
                )}
              </div>
              {activeMindmap !== null && (
                <div className={styles.buttonGroup}>
                  <button className={styles.focusButton} onClick={focusDiagram}>
                    <FaSearchPlus /> Focus sơ đồ
                  </button>
                  <button
                    className={styles.fullScreenButton}
                    onClick={openModal}
                  >
                    <FaExpand /> Phóng to
                  </button>
                </div>
              )}
            </div>
            {isModalOpen && (
              <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                  <button className={styles.closeButton} onClick={closeModal}>
                    <FaTimes />
                  </button>
                  <div
                    ref={modalMindmapRef}
                    className={styles.modalMindmap}
                  ></div>
                </div>
              </div>
            )}
            {questions.length > 0 && (
              <div className={styles.quizSection}>
                <h4 className={styles.quizTitle}>
                  <FaStar style={{ color: "#fff176" }} /> Câu hỏi đọc hiểu
                </h4>
                {questions.map((q, i) => (
                  <div key={i} className={styles.quizBox}>
                    <ReactMarkdown>{q}</ReactMarkdown>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <section className={styles.notesSection}>
          <h3 className={styles.sectionTitle}>
            <FaStar style={{ color: "#fff176" }} /> Sơ đồ giúp đọc truyện thế
            nào?
          </h3>
          <div className={styles.notesContent}>
            <div className={styles.noteBox}>
              <strong>Sơ đồ cây:</strong> Chia nhỏ câu chuyện ra thành các phần,
              như nhân vật, sự kiện, hay cái kết. Dễ hiểu truyện hơn nè!
            </div>
            <div className={styles.noteBox}>
              <strong>Lưu đồ:</strong> Xem truyện diễn ra từng bước một, giống
              như kể lại chuyện gì xảy ra trước, xảy ra sau.
            </div>
            <div className={styles.noteBox}>
              <strong>Sơ đồ vòng:</strong> Tập trung vào nhân vật chính, rồi
              thêm các chi tiết xung quanh như bạn bè, sở thích, hay hành động.
            </div>
            <div className={styles.noteBox}>
              <strong>Dòng thời gian:</strong> Sắp xếp chuyện theo thứ tự thời
              gian, để biết chuyện gì xảy ra lúc nào trong truyện.
            </div>
            <div className={styles.noteBox}>
              <strong>Sơ đồ xương cá:</strong> Tìm hiểu vì sao nhân vật buồn hay
              vui, bằng cách xem các lý do trong truyện.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MindmapPage;