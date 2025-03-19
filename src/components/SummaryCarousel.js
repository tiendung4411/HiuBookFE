import React, { useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from '../styles/SummaryCarousel.module.css';

const SummaryCarousel = ({ title, items }) => {
    const carouselRef = useRef(null);
    const scrollAmount = 300;

    const scrollLeft = () => {
        carouselRef.current?.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    };

    const scrollRight = () => {
        carouselRef.current?.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    return (
        <section className={styles.summarySection}>
            <h2>{title}</h2>
            <div className={styles.carouselContainer}>
                <button
                    className={styles.scrollButton}
                    onClick={scrollLeft}
                    aria-label="Scroll left"
                >
                    <FaChevronLeft />
                </button>
                <div
                    className={styles.summaryCarousel}
                    ref={carouselRef}
                >
                    {items.map((item) => (
                        <div key={item.id} className={styles.summaryCard}>
                            <img
                                src={item.image}
                                alt={item.title}
                                className={styles.summaryImage}
                            />
                            <p className={styles.summaryTitle}>{item.title}</p>
                        </div>
                    ))}
                </div>
                <button
                    className={`${styles.scrollButton} ${styles.right}`}
                    onClick={scrollRight}
                    aria-label="Scroll right"
                >
                    <FaChevronRight />
                </button>
            </div>
        </section>
    );
};

export default SummaryCarousel;
