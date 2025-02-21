import React, { useState, useEffect } from "react";
import { Input, Button, Typography, Row, Col, Spin, Alert } from "antd";
import { GithubOutlined } from "@ant-design/icons";
import {
  DndContext,
  closestCorners,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";

import { useAppSelector, useAppDispatch } from "../store/store";
import { fetchIssues, resetError } from "../store/issuesSlice";
import useStoredState from "../hooks/useStoredState";
import { columns, ColumnType, Issue, IssueFromAPI } from "../types/types";

import KanbanColumn from "./KanbanColumn";
import IssueCard from "./IssueCard";

const { Title, Link, Text } = Typography;

const KanbanBoard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { issues, repoPath, stars, status, error } = useAppSelector(
    (state) => state.issues
  );

  const [repoUrl, setRepoUrl] = useState("");
  const [storedRepoPath, setStoredRepoPath] = useStoredState("repoPath", "");
  const [storedStars, setStoredStars] = useStoredState("stars", 0);
  const repoKey = `issues_${storedRepoPath}`;
  const [storedIssues, setStoredIssues] = useStoredState<Issue[]>(repoKey, []);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  const formatIssues = (issuesData: IssueFromAPI[], previousIssues: Issue[]) =>
    issuesData.map((issue) => ({
      id: String(issue.id),
      title: issue.title,
      number: issue.number,
      user: { login: issue.user?.login ?? "Unknown" },
      comments: Number(issue.comments) || 0,
      created_at: new Date(issue.created_at).toISOString(),
      column:
        previousIssues.find((prevIssue) => prevIssue.id === String(issue.id))
          ?.column || "To Do",
    }));

  useEffect(() => {
    if (storedRepoPath) {
      localStorage.setItem(repoKey, JSON.stringify(storedIssues));
      localStorage.setItem(
        `stars_${storedRepoPath}`,
        JSON.stringify(storedStars)
      );
    }
  }, [storedRepoPath, storedIssues, storedStars, repoKey]);

  useEffect(() => {
    if (issues.length > 0) {
      const formattedIssues = formatIssues(issues, storedIssues);

      if (JSON.stringify(storedIssues) !== JSON.stringify(formattedIssues)) {
        setStoredIssues(formattedIssues);
      }

      if (storedRepoPath !== repoPath) {
        setStoredRepoPath(repoPath);
      }

      if (storedStars !== stars) {
        setStoredStars(stars);
      }
    }
  }, [issues, repoPath, stars]);

  const handleLoadIssues = () => {
    const trimmedUrl = repoUrl.trim();
    if (!trimmedUrl) return;

    dispatch(resetError());
    const newRepoPath = trimmedUrl.replace("https://github.com/", "");
    const savedIssues = localStorage.getItem(`issues_${newRepoPath}`);
    const savedStars =
      Number(localStorage.getItem(`stars_${newRepoPath}`)) || 0;

    if (savedIssues) {
      try {
        setStoredIssues(JSON.parse(savedIssues));
        setStoredRepoPath(newRepoPath);
        setStoredStars(savedStars);
      } catch (e) {
        console.error("Error parsing saved issues:", e);
        setStoredIssues([]);
      }
    } else {
      dispatch(fetchIssues(repoUrl))
        .unwrap()
        .then((result) => {
          const formattedIssues = formatIssues(result.issues, []);
          setStoredRepoPath(result.repoPath);
          setStoredStars(result.stars);
          setStoredIssues(formattedIssues);
          localStorage.setItem(
            `issues_${result.repoPath}`,
            JSON.stringify(formattedIssues)
          );
          localStorage.setItem(
            `stars_${result.repoPath}`,
            JSON.stringify(result.stars)
          );
        })
        .catch((err) => {
          if (err.response?.status === 404) {
            setStoredIssues([]);
            setStoredStars(0);
          }
        });
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    const draggedIssue = storedIssues.find(
      (issue) => issue.id === event.active.id
    );
    setActiveIssue(draggedIssue || null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveIssue(null);
    if (!event.over) return;

    setStoredIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue.id === event.active.id
          ? { ...issue, column: event.over!.id as ColumnType }
          : issue
      )
    );
  };

  const formatStars = (stars: number) =>
    stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars.toString();

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Kanban Board</Title>
      <Input
        placeholder="Enter GitHub repo URL"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        style={{ width: "300px", marginRight: "10px" }}
      />
      <Button
        type="primary"
        onClick={handleLoadIssues}
        icon={<GithubOutlined />}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Loading..." : "Load Issues"}
      </Button>
      {status === "loading" && <Spin style={{ marginLeft: 10 }} />}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginTop: 10 }}
        />
      )}
      {storedRepoPath && (
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <Link
            href={`https://github.com/${storedRepoPath.split("/")[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              color: "black",
            }}
          >
            {storedRepoPath.split("/")[0]}
          </Link>
          <span>{">"}</span>
          <Link
            href={`https://github.com/${storedRepoPath}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", color: "black" }}
          >
            {storedRepoPath.split("/")[1]}
          </Link>
          <Text> ⭐ {formatStars(storedStars)} stars</Text>
        </div>
      )}
      <Row gutter={16} style={{ marginTop: "20px" }}>
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          {columns.map((column) => (
            <Col key={column} span={8}>
              <KanbanColumn
                title={column}
                issues={storedIssues.filter((issue) => issue.column === column)}
              />
            </Col>
          ))}
          <DragOverlay>
            {activeIssue ? <IssueCard issue={activeIssue} /> : null}
          </DragOverlay>
        </DndContext>
      </Row>
    </div>
  );
};

export default KanbanBoard;
