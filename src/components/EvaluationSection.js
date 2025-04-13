import React, { useEffect, useRef } from "react";
import styles from "../styles/SummaryPage.module.css";
import {
  Chart,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  LineController,
  PointElement,
  LineElement,
  PieController,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import * as tf from "@tensorflow/tfjs";

Chart.register(
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  LineController,
  PointElement,
  LineElement,
  PieController,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const EvaluationSection = ({ originalText, summaryText, method }) => {
  const chartRefs = {
    wordCount: useRef(null),
    sentenceLength: useRef(null),
    bertScore: useRef(null),
    rouge: useRef(null),
    bleu: useRef(null),
    cosine: useRef(null),
    reduction: useRef(null),
    comparison: useRef(null)
  };
  const chartInstances = useRef({});

  // Tokenize đơn giản bằng JS thuần
  const tokenize = (text) => text.toLowerCase().split(/\s+/).filter(Boolean);

  const calculateMetrics = async (original, summary) => {
    const originalWords = original.split(/\s+/).filter(Boolean).length;
    const summaryWords = summary.split(/\s+/).filter(Boolean).length;
    const originalSentences = original.split(/[.!?]+/).filter(Boolean);
    const summarySentences = summary.split(/[.!?]+/).filter(Boolean);

    const rougeScore = calculateRouge(originalSentences, summarySentences);
    const bleuScore = calculateBleu(originalSentences, summarySentences);
    const bertScore = await calculateBertScore(original, summary);
    const cosineSim = await calculateCosineSimilarity(original, summary);

    return {
      wordCount: { original: originalWords, summary: summaryWords },
      avgSentenceLength: {
        original: originalWords / originalSentences.length || 0,
        summary: summaryWords / summarySentences.length || 0
      },
      reductionRatio: (1 - summaryWords / originalWords) * 100 || 0,
      rouge: rougeScore,
      bleu: bleuScore,
      bert: bertScore,
      cosine: cosineSim
    };
  };

  const calculateRouge = (originalSentences, summarySentences) => {
    const originalWords = originalSentences.flatMap((sent) => tokenize(sent));
    const summaryWords = summarySentences.flatMap((sent) => tokenize(sent));

    const intersection = originalWords.filter((word) =>
      summaryWords.includes(word)
    );
    const rouge1 = intersection.length / originalWords.length || 0;
    const rouge2 = calculateNgramOverlap(
      originalSentences,
      summarySentences,
      2
    );
    const rougeL = rouge1;

    return { rouge1, rouge2, rougeL };
  };

  const calculateNgramOverlap = (originalSentences, summarySentences, n) => {
    const getNgrams = (text, n) => {
      const words = tokenize(text.join(" "));
      const ngrams = [];
      for (let i = 0; i <= words.length - n; i++) {
        ngrams.push(words.slice(i, i + n).join(" "));
      }
      return ngrams;
    };
    const origNgrams = getNgrams(originalSentences, n);
    const sumNgrams = getNgrams(summarySentences, n);
    const intersection = origNgrams.filter((ngram) =>
      sumNgrams.includes(ngram)
    );
    return intersection.length / origNgrams.length || 0;
  };

  const calculateBleu = (originalSentences, summarySentences) => {
    const references = originalSentences.map((sent) => tokenize(sent));
    const hypothesis = tokenize(summarySentences.join(" "));

    const getNgrams = (tokens, n) => {
      const ngrams = [];
      for (let i = 0; i <= tokens.length - n; i++) {
        ngrams.push(tokens.slice(i, i + n).join(" "));
      }
      return ngrams;
    };

    const clipCount = (ngram, refs) => {
      let maxCount = 0;
      refs.forEach((ref) => {
        const refCount = ref.filter((r) => r === ngram).length;
        maxCount = Math.max(maxCount, refCount);
      });
      return maxCount;
    };

    const bleuN = (n) => {
      const hypNgrams = getNgrams(hypothesis, n);
      const refNgrams = references.map((ref) => getNgrams(ref, n));
      let matches = 0;
      hypNgrams.forEach((ngram) => {
        matches += Math.min(1, clipCount(ngram, refNgrams));
      });
      return matches / hypNgrams.length || 0;
    };

    const brevityPenalty = () => {
      const refLength =
        references.reduce((sum, ref) => sum + ref.length, 0) /
        references.length;
      const hypLength = hypothesis.length;
      return hypLength < refLength ? Math.exp(1 - refLength / hypLength) : 1;
    };

    const bleu1 = bleuN(1) * brevityPenalty();
    const bleu2 = bleuN(2) * brevityPenalty();
    const bleu4 = bleuN(4) * brevityPenalty();

    return { bleu1, bleu2, bleu4 };
  };

  const calculateBertScore = async (original, summary) => {
    const originalTokens = tokenize(original);
    const summaryTokens = tokenize(summary);

    const wordSet = new Set([...originalTokens, ...summaryTokens]);
    const originalVec = Array.from(wordSet).map(
      (word) => originalTokens.filter((w) => w === word).length
    );
    const summaryVec = Array.from(wordSet).map(
      (word) => summaryTokens.filter((w) => w === word).length
    );

    const a = tf.tensor1d(originalVec);
    const b = tf.tensor1d(summaryVec);
    const dotProduct = tf.dot(a, b).dataSync()[0];
    const normA = tf.norm(a).dataSync()[0];
    const normB = tf.norm(b).dataSync()[0];
    const f1 = dotProduct / (normA * normB) || 0;

    return { precision: f1, recall: f1, f1 };
  };

  const calculateCosineSimilarity = async (original, summary) => {
    const originalTokens = tokenize(original);
    const summaryTokens = tokenize(summary);

    const wordSet = new Set([...originalTokens, ...summaryTokens]);
    const originalVec = Array.from(wordSet).map(
      (word) => originalTokens.filter((w) => w === word).length
    );
    const summaryVec = Array.from(wordSet).map(
      (word) => summaryTokens.filter((w) => w === word).length
    );

    const a = tf.tensor1d(originalVec);
    const b = tf.tensor1d(summaryVec);
    const dotProduct = tf.dot(a, b).dataSync()[0];
    const normA = tf.norm(a).dataSync()[0];
    const normB = tf.norm(b).dataSync()[0];
    return dotProduct / (normA * normB) || 0;
  };

  useEffect(() => {
    if (!originalText || !summaryText) return;

    const renderCharts = async () => {
      const metrics = await calculateMetrics(originalText, summaryText);

      Object.values(chartInstances.current).forEach((chart) =>
        chart?.destroy()
      );

      chartInstances.current.wordCount = new Chart(
        chartRefs.wordCount.current,
        {
          type: "bar",
          data: {
            labels: ["Văn bản gốc", "Tóm tắt"],
            datasets: [
              {
                label: "Số từ",
                data: [metrics.wordCount.original, metrics.wordCount.summary],
                backgroundColor: method === "extract" ? "#1e90ff" : "#27ae60"
              }
            ]
          },
          options: {
            scales: {
              y: { beginAtZero: true, title: { display: true, text: "Số từ" } }
            }
          }
        }
      );

      chartInstances.current.sentenceLength = new Chart(
        chartRefs.sentenceLength.current,
        {
          type: "bar",
          data: {
            labels: ["Văn bản gốc", "Tóm tắt"],
            datasets: [
              {
                label: "Độ dài câu TB",
                data: [
                  metrics.avgSentenceLength.original,
                  metrics.avgSentenceLength.summary
                ],
                backgroundColor: method === "extract" ? "#3498db" : "#52be80"
              }
            ]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: "Số từ/câu" }
              }
            }
          }
        }
      );

      chartInstances.current.bertScore = new Chart(
        chartRefs.bertScore.current,
        {
          type: "bar",
          data: {
            labels: ["Precision", "Recall", "F1"],
            datasets: [
              {
                label: "BERTScore",
                data: [
                  metrics.bert.precision,
                  metrics.bert.recall,
                  metrics.bert.f1
                ],
                backgroundColor: ["#1e90ff", "#27ae60", "#e67e22"]
              }
            ]
          },
          options: {
            scales: { y: { max: 1, title: { display: true, text: "Điểm" } } }
          }
        }
      );

      chartInstances.current.rouge = new Chart(chartRefs.rouge.current, {
        type: "bar",
        data: {
          labels: ["ROUGE-1", "ROUGE-2", "ROUGE-L"],
          datasets: [
            {
              label: "ROUGE",
              data: [
                metrics.rouge.rouge1,
                metrics.rouge.rouge2,
                metrics.rouge.rougeL
              ],
              backgroundColor: ["#1e90ff", "#27ae60", "#9b59b6"]
            }
          ]
        },
        options: {
          scales: { y: { max: 1, title: { display: true, text: "Điểm" } } }
        }
      });

      chartInstances.current.bleu = new Chart(chartRefs.bleu.current, {
        type: "bar",
        data: {
          labels: ["BLEU-1", "BLEU-2", "BLEU-4"],
          datasets: [
            {
              label: "BLEU",
              data: [
                metrics.bleu.bleu1,
                metrics.bleu.bleu2,
                metrics.bleu.bleu4
              ],
              backgroundColor: ["#1e90ff", "#27ae60", "#9b59b6"]
            }
          ]
        },
        options: {
          scales: { y: { max: 1, title: { display: true, text: "Điểm" } } }
        }
      });

      chartInstances.current.cosine = new Chart(chartRefs.cosine.current, {
        type: "bar",
        data: {
          labels: ["Cosine Similarity"],
          datasets: [
            {
              label: "Độ tương đồng",
              data: [metrics.cosine],
              backgroundColor: method === "extract" ? "#1e90ff" : "#27ae60"
            }
          ]
        },
        options: {
          scales: { y: { max: 1, title: { display: true, text: "Điểm" } } }
        }
      });

      chartInstances.current.reduction = new Chart(
        chartRefs.reduction.current,
        {
          type: "pie",
          data: {
            labels: ["Giữ lại", "Lược bỏ"],
            datasets: [
              {
                data: [100 - metrics.reductionRatio, metrics.reductionRatio],
                backgroundColor: ["#27ae60", "#e74c3c"]
              }
            ]
          },
          options: {
            plugins: { title: { display: true, text: "Tỷ lệ giảm số từ" } }
          }
        }
      );

      chartInstances.current.comparison = new Chart(
        chartRefs.comparison.current,
        {
          type: "line",
          data: {
            labels: ["Word Count", "BERT F1", "ROUGE-1", "BLEU-1"],
            datasets: [
              {
                label: "Extract",
                data:
                  method === "extract"
                    ? [
                        metrics.wordCount.summary,
                        metrics.bert.f1,
                        metrics.rouge.rouge1,
                        metrics.bleu.bleu1
                      ]
                    : [0, 0, 0, 0],
                borderColor: "#1e90ff"
              },
              {
                label: "Paraphrase",
                data:
                  method === "paraphrase"
                    ? [
                        metrics.wordCount.summary,
                        metrics.bert.f1,
                        metrics.rouge.rouge1,
                        metrics.bleu.bleu1
                      ]
                    : [0, 0, 0, 0],
                borderColor: "#27ae60"
              }
            ]
          },
          options: {
            scales: { y: { title: { display: true, text: "Giá trị" } } }
          }
        }
      );
    };

    renderCharts();

    return () => {
      Object.values(chartInstances.current).forEach((chart) =>
        chart?.destroy()
      );
    };
  }, [originalText, summaryText, method]);

  return (
    <div className={styles.evaluationContainer}>
      <h3 className={styles.sectionTitle}>Đánh giá bản tóm tắt 📊</h3>
      <div className={styles.chartGrid}>
        <div className={styles.chartBox}>
          <canvas ref={chartRefs.wordCount} />
        </div>
        <div className={styles.chartBox}>
          <canvas ref={chartRefs.sentenceLength} />
        </div>
        <div className={styles.chartBox}>
          <canvas ref={chartRefs.bertScore} />
        </div>
        <div className={styles.chartBox}>
          <canvas ref={chartRefs.rouge} />
        </div>
        <div className={styles.chartBox}>
          <canvas ref={chartRefs.bleu} />
        </div>
        <div className={styles.chartBox}>
          <canvas ref={chartRefs.cosine} />
        </div>
        <div className={styles.chartBox}>
          <canvas ref={chartRefs.reduction} />
        </div>
        <div className={styles.chartBox}>
          <canvas ref={chartRefs.comparison} />
        </div>
      </div>
    </div>
  );
};

export default EvaluationSection;
