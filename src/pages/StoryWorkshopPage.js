import React, { useState, useEffect } from "react";
import styles from "../styles/StoryWorkshopPage.module.css";
import { FaStar, FaRocket, FaHome } from "react-icons/fa"; // Thêm FaHome cho nút thoát
import Confetti from "react-confetti";
import { ClipLoader } from "react-spinners";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate để điều hướng

const StoryWorkshopPage = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [name, setName] = useState("");
  const [currentStory, setCurrentStory] = useState(null);
  const [storyEvents, setStoryEvents] = useState([]);
  const [stories, setStories] = useState([]);
  const [stars, setStars] = useState(0);
  const [badges, setBadges] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const navigate = useNavigate(); // Khởi tạo useNavigate

  const genAI = new GoogleGenerativeAI(
    "AIzaSyBGoIsACZY4vbiEg5jyf8Sbf7XIdAgf9cc"
  );

  // Truyện cổ tích cố định (Thêm 3 truyện mới)
  const classicStories = [
    {
      id: "tre",
      title: "Cây Tre Trăm Đốt",
      text: "Anh nông dân nghèo bị phú ông lừa, chỉ được chia mảnh đất xấu. Anh chăm chỉ trồng tre, nghe lời thần linh đốt tre thành trăm đốt. Anh dùng tre trăm đốt trói phú ông để đòi lại ruộng. Cuối cùng, anh lấy lại được đất và sống hạnh phúc.",
      events: [
        {
          id: "t1",
          text: "Phú ông lừa anh nông dân, chia mảnh đất xấu.",
          order: 1
        },
        {
          id: "t2",
          text: "Anh trồng tre và được thần linh mách bảo.",
          order: 2
        },
        {
          id: "t3",
          text: "Anh đốt tre thành trăm đốt, trói phú ông.",
          order: 3
        },
        { id: "t4", text: "Anh lấy lại đất và sống hạnh phúc.", order: 4 }
      ],
      badge: "Nhà Tóm Tắt Công Lý"
    },
    {
      id: "dua",
      title: "Sự Tích Dưa Hấu",
      text: "Mai An Tiêm bị vua đày ra đảo hoang vì kiêu ngạo. Anh tìm thấy hạt lạ, trồng thành dưa hấu ngọt ngào. Anh dùng dưa hấu đổi lấy đồ ăn từ thuyền buôn. Cuối cùng, vua tha thứ và đón anh về.",
      events: [
        { id: "d1", text: "Mai An Tiêm bị đày ra đảo hoang.", order: 1 },
        { id: "d2", text: "Anh trồng hạt lạ thành dưa hấu.", order: 2 },
        { id: "d3", text: "Anh đổi dưa hấu lấy đồ ăn.", order: 3 },
        { id: "d4", text: "Vua tha thứ và đón anh về.", order: 4 }
      ],
      badge: "Nhà Tóm Tắt Sáng Tạo"
    },
    {
      id: "thach",
      title: "Thạch Sanh",
      text: "Thạch Sanh mồ côi sống trong rừng, được thần dạy võ. Anh giết chằn tinh cứu công chúa bị nhốt trong hang. Lý Thông lừa anh, cướp công cứu công chúa. Cuối cùng, Thạch Sanh dùng đàn thần đánh bại Lý Thông và cưới công chúa.",
      events: [
        { id: "s1", text: "Thạch Sanh được thần dạy võ.", order: 1 },
        { id: "s2", text: "Anh giết chằn tinh cứu công chúa.", order: 2 },
        { id: "s3", text: "Lý Thông lừa cướp công của anh.", order: 3 },
        {
          id: "s4",
          text: "Thạch Sanh đánh bại Lý Thông và cưới công chúa.",
          order: 4
        }
      ],
      badge: "Nhà Tóm Tắt Dũng Cảm"
    },
    {
      id: "tam",
      title: "Tấm Cám",
      text: "Tấm bị mẹ con Cám hành hạ, mất hết tài sản. Cô được cá bống giúp đỡ, đi dự hội. Tấm đánh rơi giày, vua tìm được và cưới cô. Cuối cùng, Cám bị trừng phạt, Tấm sống hạnh phúc bên vua.",
      events: [
        { id: "c1", text: "Tấm bị mẹ con Cám hành hạ.", order: 1 },
        { id: "c2", text: "Cá bống giúp Tấm đi dự hội.", order: 2 },
        { id: "c3", text: "Tấm đánh rơi giày, vua cưới cô.", order: 3 },
        { id: "c4", text: "Cám bị trừng phạt, Tấm hạnh phúc.", order: 4 }
      ],
      badge: "Nhà Tóm Tắt Kiên Nhẫn"
    },
    {
      id: "ho",
      title: "Sự Tích Hồ Gươm",
      text: "Vua Lê Lợi nhận gươm thần từ rùa vàng để đánh giặc. Ông dùng gươm thần thắng trận, đuổi giặc Minh ra khỏi nước. Sau chiến thắng, rùa vàng đòi lại gươm. Vua trả gươm, hồ được gọi là Hồ Gươm.",
      events: [
        { id: "h1", text: "Vua Lê Lợi nhận gươm thần từ rùa vàng.", order: 1 },
        { id: "h2", text: "Vua thắng giặc Minh nhờ gươm thần.", order: 2 },
        { id: "h3", text: "Rùa vàng đòi lại gươm sau chiến thắng.", order: 3 },
        { id: "h4", text: "Vua trả gươm, hồ thành Hồ Gươm.", order: 4 }
      ],
      badge: "Nhà Tóm Tắt Lịch Sử"
    },
    {
      id: "son",
      title: "Sơn Tinh Thủy Tinh",
      text: "Vua Hùng kén rể, chọn Sơn Tinh và Thủy Tinh thi tài. Sơn Tinh mang lễ vật đến trước, cưới được công chúa. Thủy Tinh tức giận, dâng nước đánh Sơn Tinh. Cuối cùng, Sơn Tinh thắng, sống hạnh phúc với công chúa.",
      events: [
        {
          id: "s1",
          text: "Vua Hùng kén rể, chọn Sơn Tinh và Thủy Tinh.",
          order: 1
        },
        {
          id: "s2",
          text: "Sơn Tinh mang lễ vật đến trước, cưới công chúa.",
          order: 2
        },
        { id: "s3", text: "Thủy Tinh dâng nước đánh Sơn Tinh.", order: 3 },
        {
          id: "s4",
          text: "Sơn Tinh thắng, sống hạnh phúc với công chúa.",
          order: 4
        }
      ],
      badge: "Nhà Tóm Tắt Sức Mạnh"
    },
    {
      id: "coc",
      title: "Cóc Kiện Trời",
      text: "Trời hạn hán lâu, Cóc dẫn bạn đi kiện Trời. Cóc gặp Cua, Gấu, Cáo giúp sức trên đường. Họ đến cung điện Trời, dọa Ngọc Hoàng phải làm mưa. Cuối cùng, Trời làm mưa, cả làng vui mừng.",
      events: [
        { id: "c1", text: "Trời hạn hán lâu, Cóc dẫn bạn đi kiện.", order: 1 },
        { id: "c2", text: "Cóc gặp Cua, Gấu, Cáo giúp sức.", order: 2 },
        { id: "c3", text: "Họ dọa Ngọc Hoàng phải làm mưa.", order: 3 },
        { id: "c4", text: "Trời làm mưa, cả làng vui mừng.", order: 4 }
      ],
      badge: "Nhà Tóm Tắt Đoàn Kết"
    },
    {
      id: "vusua",
      title: "Sự Tích Cây Vú Sữa",
      text: "Cậu bé nghịch ngợm bỏ nhà đi, mẹ buồn chờ con. Cậu chết hóa thành cây vú sữa bên nhà. Mẹ khóc, cây ra quả ngọt gọi mẹ. Cuối cùng, mẹ hiểu con đã về, ôm cây khóc.",
      events: [
        { id: "v1", text: "Cậu bé nghịch ngợm bỏ nhà đi.", order: 1 },
        { id: "v2", text: "Cậu chết hóa thành cây vú sữa.", order: 2 },
        { id: "v3", text: "Mẹ khóc, cây ra quả ngọt gọi mẹ.", order: 3 },
        { id: "v4", text: "Mẹ hiểu con đã về, ôm cây khóc.", order: 4 }
      ],
      badge: "Nhà Tóm Tắt Tình Thân"
    }
  ];

  useEffect(() => {
    const fetchGeminiStories = async () => {
      setIsLoading(true);
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
          Tạo 5 truyện ngắn vui nhộn, đơn giản cho trẻ em (mỗi truyện 4-5 câu), mỗi truyện có bài học rõ ràng. 
          Mỗi truyện bao gồm: 
          - Tiêu đề (title)
          - Nội dung đầy đủ (text)
          - 4 sự kiện chính (events) với thứ tự logic (order từ 1-4)
          - Huy hiệu (badge) như "Nhà Tóm Tắt Vui Vẻ"
          Định dạng JSON như sau:
          {
            "id": "unique-id",
            "title": "Tiêu đề",
            "text": "Nội dung truyện",
            "events": [
              { "id": "e1", "text": "Sự kiện 1", "order": 1 },
              { "id": "e2", "text": "Sự kiện 2", "order": 2 },
              { "id": "e3", "text": "Sự kiện 3", "order": 3 },
              { "id": "e4", "text": "Sự kiện 4", "order": 4 }
            ],
            "badge": "Huy hiệu"
          }
        `;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const geminiStories = JSON.parse(response.text());
        setStories([...classicStories, ...geminiStories]);
      } catch (error) {
        console.error("Lỗi khi lấy truyện từ Gemini:", error);
        setStories(classicStories); // Fallback về truyện cổ tích nếu lỗi
      }
      setIsLoading(false);
    };
    fetchGeminiStories();
  }, []);

  const startAdventure = () => {
    if (!name) {
      alert("Nhập tên bạn để làm nhà tóm tắt nha!");
      return;
    }
    setShowWelcome(false);
  };

  const selectStory = (storyId) => {
    const story = stories.find((s) => s.id === storyId);
    const shuffledEvents = [...story.events].sort(() => Math.random() - 0.5);
    setCurrentStory(story);
    setStoryEvents(shuffledEvents);
    setStars(0);
    setIsChecking(false);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedEvents = Array.from(storyEvents);
    const [movedEvent] = reorderedEvents.splice(result.source.index, 1);
    reorderedEvents.splice(result.destination.index, 0, movedEvent);
    setStoryEvents(reorderedEvents);
  };

  const checkOrder = () => {
    setIsChecking(true);
    const isCorrect = storyEvents.every(
      (event, index) => event.order === index + 1
    );
    if (isCorrect) {
      setStars((prev) => prev + 10);
      if (!badges.includes(currentStory.badge)) {
        setBadges((prev) => [...prev, currentStory.badge]);
      }
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setTimeout(() => setIsChecking(false), 1000);
  };

  const resetGame = () => {
    setCurrentStory(null);
    setStoryEvents([]);
    setStars(0);
    setBadges([]);
  };

  const exitGame = () => {
    navigate("/"); // Quay về trang chủ
  };

  return (
    <div className={styles.container}>
      {/* Nút thoát */}
      <button onClick={exitGame} className={styles.exitButton}>
        <FaHome /> Về trang chủ
      </button>

      {showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}
      {showWelcome ? (
        <div className={styles.welcome}>
          <h1 className={styles.title}>
            <FaStar /> Kho Báu Truyện Cổ Tích <FaStar />
          </h1>
          <p className={styles.hint}>
            Bạn nhỏ ơi, sẵn sàng tóm tắt truyện chưa?
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên nhà tóm tắt nha!"
            className={styles.nameInput}
          />
          <button
            onClick={startAdventure}
            className={styles.startButton}
            disabled={!name}
          >
            <FaRocket /> Bắt đầu nào!
          </button>
        </div>
      ) : isLoading ? (
        <div className={styles.loading}>
          <ClipLoader color="#e8b923" size={60} />
          <p className={styles.loadingText}>Đang tải kho truyện...</p>
        </div>
      ) : !currentStory ? (
        <div className={styles.step}>
          <h3 className={styles.stepTitle}>
            Chọn truyện nào, nhà tóm tắt {name}?
          </h3>
          <div className={styles.options}>
            {stories.map((story) => (
              <button
                key={story.id}
                className={styles.optionButton}
                onClick={() => selectStory(story.id)}
              >
                {story.title}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.diary}>
          <div className={styles.points}>Sao: {stars}</div>
          <div className={styles.timeBox}>Truyện: {currentStory.title}</div>
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>Đọc truyện và sắp xếp nhé!</h3>
            <div className={styles.storyBox}>{currentStory.text}</div>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="events">
              {(provided) => (
                <div
                  className={styles.eventList}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {storyEvents.map((event, index) => (
                    <Draggable
                      key={event.id}
                      draggableId={event.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className={styles.eventItem}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <span>{event.text}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <button
            onClick={checkOrder}
            className={styles.createButton}
            disabled={isChecking}
          >
            <FaRocket /> Kiểm tra thứ tự!
          </button>
          {isChecking ? (
            <div className={styles.loading}>
              <ClipLoader color="#e8b923" size={60} />
              <p className={styles.loadingText}>Đang kiểm tra...</p>
            </div>
          ) : stars > 0 ? (
            <div className={styles.result}>
              <p className={styles.hint}>
                Tuyệt vời, nhà tóm tắt {name}! Thứ tự đúng rồi!
              </p>
              {badges.length > 0 && (
                <div className={styles.badgeSection}>
                  <h3 className={styles.stepTitle}>Huy Hiệu Của {name}</h3>
                  <div className={styles.badges}>
                    {badges.map((badge, index) => (
                      <span key={index} className={styles.badge}>
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={resetGame} className={styles.resetButton}>
                <FaStar /> Chọn truyện mới!
              </button>
            </div>
          ) : (
            <div className={styles.result}>
              <p className={styles.hint}>
                Thứ tự chưa đúng, thử lại hoặc chọn truyện mới nhé, nhà tóm tắt{" "}
                {name}!
              </p>
              <button onClick={resetGame} className={styles.resetButton}>
                <FaStar /> Chọn truyện mới!
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryWorkshopPage;
