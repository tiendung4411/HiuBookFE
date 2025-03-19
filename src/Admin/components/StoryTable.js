// src/Admin/components/StoryTable.js
import React from "react";
import styles from "../styles/StoryManagement.module.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const StoryTable = ({
  stories,
  onView,
  onEdit,
  onDelete,
  selectedStories,
  onSelectStory
}) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={
                selectedStories.length === stories.length && stories.length > 0
              }
              onChange={() =>
                onSelectStory(
                  selectedStories.length === stories.length
                    ? []
                    : stories.map((story) => story.id)
                )
              }
            />
          </th>
          <th>ID</th>
          <th>Tiêu đề</th>
          <th>Lớp học</th>
          <th>Trạng thái</th>
          <th>Ngày tạo</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {stories.map((story) => (
          <tr key={story.id}>
            <td>
              <input
                type="checkbox"
                checked={selectedStories.includes(story.id)}
                onChange={() => onSelectStory(story.id)}
              />
            </td>
            <td>{story.id}</td>
            <td>{story.title}</td>
            <td>{story.class}</td>
            <td>{story.status}</td>
            <td>{story.createdAt}</td>
            <td>
              <button
                className={styles.viewButton}
                onClick={() => onView(story)}
              >
                <FaEye />
              </button>
              <button
                className={styles.editButton}
                onClick={() => onEdit(story)}
              >
                <FaEdit />
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => onDelete(story.id)}
              >
                <FaTrash />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StoryTable;
